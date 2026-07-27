import { AbortedError, TimeoutError, toAppError } from "./app-error";
import { isRetryableError } from "./formatter";

/** A successful result. */
export interface OkResult<T> {
  readonly ok: true;
  readonly value: T;
}

/** A failed result carrying the error. */
export interface ErrResult<E> {
  readonly ok: false;
  readonly error: E;
}

/**
 * A discriminated result, used where throwing would be awkward — most notably
 * in server actions, which must return serialisable values.
 */
export type Result<T, E = Error> = OkResult<T> | ErrResult<E>;

/**
 * Wraps a value in a successful result.
 *
 * @param value - The success value.
 * @returns An `ok` result.
 */
export function ok<T>(value: T): OkResult<T> {
  return { ok: true, value };
}

/**
 * Wraps an error in a failed result.
 *
 * @param error - The failure.
 * @returns An `err` result.
 */
export function err<E>(error: E): ErrResult<E> {
  return { ok: false, error };
}

/**
 * Runs an async function and captures any thrown value as a `Result`.
 *
 * @param operation - The operation to run.
 * @returns An `ok` result on success, or an `err` result holding an `AppError`.
 */
export async function attempt<T>(operation: () => Promise<T>): Promise<Result<T, Error>> {
  try {
    return ok(await operation());
  } catch (error) {
    return err(toAppError(error));
  }
}

/**
 * Runs a synchronous function and captures any thrown value as a `Result`.
 *
 * @param operation - The operation to run.
 * @returns An `ok` result on success, or an `err` result holding an `AppError`.
 */
export function attemptSync<T>(operation: () => T): Result<T, Error> {
  try {
    return ok(operation());
  } catch (error) {
    return err(toAppError(error));
  }
}

/**
 * Runs an operation and falls back to a default value on failure.
 *
 * @param operation - The operation to run.
 * @param fallback - Value returned when the operation throws.
 * @returns The operation's value, or the fallback.
 */
export async function withFallback<T>(
  operation: () => Promise<T>,
  fallback: T,
): Promise<T> {
  const result = await attempt(operation);
  return result.ok ? result.value : fallback;
}

/** Configuration for {@link retry}. */
export interface RetryOptions {
  /** Total attempts including the first. Defaults to 3. */
  readonly attempts?: number;
  /** Delay before the first retry, in milliseconds. Defaults to 300. */
  readonly baseDelayMs?: number;
  /** Upper bound on any single delay, in milliseconds. Defaults to 10 000. */
  readonly maxDelayMs?: number;
  /** Decides whether a given error should be retried. Defaults to {@link isRetryableError}. */
  readonly shouldRetry?: (error: unknown, attempt: number) => boolean;
  /** Invoked before each retry, useful for logging. */
  readonly onRetry?: (error: unknown, attempt: number, delayMs: number) => void;
  /** Cancels pending retries. */
  readonly signal?: AbortSignal;
}

/**
 * Computes an exponential backoff delay with full jitter.
 *
 * Full jitter avoids the thundering-herd problem where many clients that failed
 * together retry in lockstep.
 *
 * @param attempt - Zero-based retry index.
 * @param baseDelayMs - Delay before the first retry.
 * @param maxDelayMs - Upper bound on the delay.
 * @returns The delay to wait, in milliseconds.
 */
export function backoffDelay(attempt: number, baseDelayMs: number, maxDelayMs: number): number {
  const exponential = Math.min(baseDelayMs * 2 ** attempt, maxDelayMs);
  return Math.round(Math.random() * exponential);
}

/**
 * Waits for a duration, rejecting early if the signal aborts.
 *
 * @param milliseconds - How long to wait.
 * @param signal - Optional abort signal.
 * @returns A promise that settles after the delay.
 */
export function delay(milliseconds: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new AbortedError());
      return;
    }

    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, milliseconds);

    function onAbort(): void {
      clearTimeout(timer);
      reject(new AbortedError());
    }

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

/**
 * Retries an operation with exponential backoff and jitter.
 *
 * @param operation - Receives the zero-based attempt number.
 * @param options - Retry policy.
 * @returns The operation's value once it succeeds.
 * @throws The final error when every attempt fails.
 */
export async function retry<T>(
  operation: (attempt: number) => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    attempts = 3,
    baseDelayMs = 300,
    maxDelayMs = 10_000,
    shouldRetry = isRetryableError,
    onRetry,
    signal,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (signal?.aborted) throw new AbortedError();

    try {
      return await operation(attempt);
    } catch (error) {
      lastError = error;

      const isFinalAttempt = attempt === attempts - 1;
      if (isFinalAttempt || !shouldRetry(error, attempt)) break;

      const waitMs = backoffDelay(attempt, baseDelayMs, maxDelayMs);
      onRetry?.(error, attempt + 1, waitMs);
      await delay(waitMs, signal);
    }
  }

  throw toAppError(lastError);
}

/**
 * Races an operation against a timeout.
 *
 * @param operation - Receives a signal that aborts when the timeout elapses.
 * @param timeoutMs - Time budget in milliseconds.
 * @returns The operation's value.
 * @throws {TimeoutError} When the budget is exceeded.
 */
export async function withTimeout<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await operation(controller.signal);
  } catch (error) {
    if (controller.signal.aborted) {
      throw new TimeoutError({ context: { timeoutMs }, cause: error });
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
