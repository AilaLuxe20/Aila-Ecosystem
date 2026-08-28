import { RateLimitError } from "@/lib/errors/app-error";

/**
 * Rate limiting abstraction.
 *
 * The interface is the contract; {@link MemoryRateLimiter} is the default
 * implementation. It is process-local, which is correct for a single instance
 * but not for a horizontally scaled deployment — swap in a Redis-backed
 * implementation of the same interface when that day comes and no call site
 * needs to change.
 */

/** The outcome of a rate limit check. */
export interface RateLimitResult {
  /** Whether the request may proceed. */
  readonly allowed: boolean;
  /** Requests permitted per window. */
  readonly limit: number;
  /** Requests still available in the current window. */
  readonly remaining: number;
  /** Unix epoch milliseconds when the window resets. */
  readonly resetAt: number;
  /** Seconds the caller should wait. Zero when allowed. */
  readonly retryAfterSeconds: number;
}

/** A rate limiting strategy. */
export interface RateLimiter {
  /**
   * Records a request against a key and reports whether it is permitted.
   *
   * @param key - Identity being limited, e.g. a user ID or IP address.
   * @returns The limit decision.
   */
  check(key: string): Promise<RateLimitResult>;

  /**
   * Clears recorded usage for a key.
   *
   * @param key - Identity to reset.
   */
  reset(key: string): Promise<void>;
}

/** Options for {@link MemoryRateLimiter}. */
export interface MemoryRateLimiterOptions {
  /** Requests permitted per window. Defaults to 60. */
  readonly limit?: number;
  /** Window length in milliseconds. Defaults to 60 000. */
  readonly windowMs?: number;
}

/** Timestamps of requests recorded for one key. */
interface RequestWindow {
  timestamps: number[];
}

/**
 * A sliding-window rate limiter held in process memory.
 *
 * A sliding window is used rather than a fixed one because fixed windows allow
 * a burst of double the limit across a boundary — 60 requests at 11:59:59 and
 * 60 more at 12:00:00.
 */
export class MemoryRateLimiter implements RateLimiter {
  private readonly windows = new Map<string, RequestWindow>();
  private readonly limit: number;
  private readonly windowMs: number;

  /** @param options - Request allowance and window length. */
  constructor(options: MemoryRateLimiterOptions = {}) {
    this.limit = options.limit ?? 60;
    this.windowMs = options.windowMs ?? 60_000;
  }

  /**
   * Records a request and reports whether it is permitted.
   *
   * @param key - Identity being limited.
   * @returns The limit decision.
   */
  async check(key: string): Promise<RateLimitResult> {
    const now = Date.now();
    const cutoff = now - this.windowMs;

    const window = this.windows.get(key) ?? { timestamps: [] };
    window.timestamps = window.timestamps.filter((timestamp) => timestamp > cutoff);

    const allowed = window.timestamps.length < this.limit;
    if (allowed) window.timestamps.push(now);

    this.windows.set(key, window);

    const oldest = window.timestamps[0] ?? now;
    const resetAt = oldest + this.windowMs;

    return {
      allowed,
      limit: this.limit,
      remaining: Math.max(0, this.limit - window.timestamps.length),
      resetAt,
      retryAfterSeconds: allowed ? 0 : Math.max(1, Math.ceil((resetAt - now) / 1000)),
    };
  }

  /**
   * Clears recorded usage for a key.
   *
   * @param key - Identity to reset.
   */
  async reset(key: string): Promise<void> {
    this.windows.delete(key);
  }

  /**
   * Drops keys with no requests inside the current window.
   *
   * Call periodically in long-lived processes so idle keys do not accumulate.
   *
   * @returns How many keys were removed.
   */
  prune(): number {
    const cutoff = Date.now() - this.windowMs;
    let removed = 0;

    for (const [key, window] of this.windows) {
      const live = window.timestamps.filter((timestamp) => timestamp > cutoff);

      if (live.length === 0) {
        this.windows.delete(key);
        removed += 1;
      } else {
        window.timestamps = live;
      }
    }

    return removed;
  }
}

/**
 * Applies a rate limit, throwing when the caller has exceeded it.
 *
 * @param limiter - The limiter to consult.
 * @param key - Identity being limited.
 * @returns The limit decision when the request is permitted.
 * @throws {RateLimitError} When the limit is exceeded.
 */
export async function enforceRateLimit(
  limiter: RateLimiter,
  key: string,
): Promise<RateLimitResult> {
  const result = await limiter.check(key);

  if (!result.allowed) {
    throw new RateLimitError(result.retryAfterSeconds, {
      context: { key, limit: result.limit, resetAt: result.resetAt },
    });
  }

  return result;
}

/**
 * Renders a limit decision as standard rate-limit response headers.
 *
 * @param result - The limit decision.
 * @returns Headers to attach to the response.
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    "RateLimit-Limit": String(result.limit),
    "RateLimit-Remaining": String(result.remaining),
    "RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  };

  if (!result.allowed) headers["Retry-After"] = String(result.retryAfterSeconds);
  return headers;
}
