import { z } from "zod";

import { flattenZodError } from "@/lib/utils/validation";

import {
  ERROR_CODES,
  ValidationError,
  isAppError,
  isError,
  toAppError,
  type ErrorCode,
} from "./app-error";

/** A user-facing description of a failure. */
export interface UserFacingError {
  /** Short heading, e.g. "Access denied". */
  readonly title: string;
  /** Sentence explaining what happened. */
  readonly description: string;
  /** Stable code, surfaced in support conversations. */
  readonly code: ErrorCode;
  /** Whether retrying the same action could succeed. */
  readonly retryable: boolean;
  /** Field-level messages when the failure was a validation error. */
  readonly fieldErrors?: Readonly<Record<string, string>>;
}

/** Titles paired with each error code. */
const ERROR_TITLES: Record<ErrorCode, string> = {
  [ERROR_CODES.VALIDATION_FAILED]: "Check your details",
  [ERROR_CODES.UNAUTHENTICATED]: "Sign in required",
  [ERROR_CODES.FORBIDDEN]: "Access denied",
  [ERROR_CODES.NOT_FOUND]: "Not found",
  [ERROR_CODES.CONFLICT]: "Already exists",
  [ERROR_CODES.RATE_LIMITED]: "Slow down",
  [ERROR_CODES.TIMEOUT]: "Took too long",
  [ERROR_CODES.NETWORK_ERROR]: "Connection problem",
  [ERROR_CODES.EXTERNAL_SERVICE_ERROR]: "Service unavailable",
  [ERROR_CODES.CONFIGURATION_ERROR]: "Configuration problem",
  [ERROR_CODES.ABORTED]: "Cancelled",
  [ERROR_CODES.INTERNAL_ERROR]: "Something went wrong",
};

/** Codes where retrying the identical request may succeed. */
const RETRYABLE_CODES: ReadonlySet<ErrorCode> = new Set<ErrorCode>([
  ERROR_CODES.RATE_LIMITED,
  ERROR_CODES.TIMEOUT,
  ERROR_CODES.NETWORK_ERROR,
  ERROR_CODES.EXTERNAL_SERVICE_ERROR,
  ERROR_CODES.INTERNAL_ERROR,
]);

/**
 * Reports whether retrying an operation that produced this error is sensible.
 *
 * @param value - The caught value.
 * @returns True when a retry could plausibly succeed.
 */
export function isRetryableError(value: unknown): boolean {
  return RETRYABLE_CODES.has(toAppError(value).code);
}

/**
 * Converts any thrown value into a structure safe to render in the UI.
 *
 * Zod errors become validation errors with their field messages preserved.
 *
 * @param value - The caught value.
 * @returns A user-facing description of the failure.
 */
export function formatErrorForUser(value: unknown): UserFacingError {
  if (value instanceof z.ZodError) {
    const validation = new ValidationError(flattenZodError(value));
    return {
      title: ERROR_TITLES[validation.code],
      description: validation.message,
      code: validation.code,
      retryable: false,
      fieldErrors: validation.fieldErrors,
    };
  }

  const error = toAppError(value);

  return {
    title: ERROR_TITLES[error.code],
    description: error.message,
    code: error.code,
    retryable: RETRYABLE_CODES.has(error.code),
    fieldErrors: error instanceof ValidationError ? error.fieldErrors : undefined,
  };
}

/**
 * Extracts a plain message from any thrown value.
 *
 * @param value - The caught value.
 * @param fallback - Returned when no message can be derived.
 * @returns The message text.
 */
export function getErrorMessage(value: unknown, fallback = "An unexpected error occurred."): string {
  if (typeof value === "string" && value.length > 0) return value;
  if (isError(value) && value.message.length > 0) return value.message;
  return fallback;
}

/**
 * Renders an error as a single diagnostic line for log output.
 *
 * @param value - The caught value.
 * @returns A compact one-line description including code and context.
 */
export function formatErrorForLog(value: unknown): string {
  const error = toAppError(value);
  const contextKeys = Object.keys(error.context);
  const contextPart =
    contextKeys.length > 0 ? ` context=${JSON.stringify(error.context)}` : "";

  return `[${error.code}] ${error.name}: ${error.message} status=${error.status}${contextPart}`;
}

/**
 * Walks the `cause` chain and returns every error in it, outermost first.
 *
 * @param value - The caught value.
 * @param maxDepth - Guards against cyclic chains. Defaults to 10.
 * @returns The chain of errors.
 */
export function getErrorChain(value: unknown, maxDepth = 10): Error[] {
  const chain: Error[] = [];
  let current: unknown = value;

  while (isError(current) && chain.length < maxDepth) {
    chain.push(current);
    current = current.cause;
  }

  return chain;
}

/**
 * Returns the deepest error in a `cause` chain, which is usually the root cause.
 *
 * @param value - The caught value.
 * @returns The innermost error, or `null` when the value is not an error.
 */
export function getRootCause(value: unknown): Error | null {
  const chain = getErrorChain(value);
  return chain.length > 0 ? chain[chain.length - 1] : null;
}

/**
 * Builds the JSON body returned to API clients for an error.
 *
 * Non-operational errors are deliberately redacted so internal details never
 * reach a client.
 *
 * @param value - The caught value.
 * @param includeDetails - Whether to include context. Enable in development only.
 * @returns The response body and the HTTP status to send with it.
 */
export function buildErrorResponseBody(
  value: unknown,
  includeDetails = false,
): { body: Record<string, unknown>; status: number } {
  const error = toAppError(value);
  const expose = error.isOperational || includeDetails;

  const body: Record<string, unknown> = {
    error: {
      code: error.code,
      message: expose ? error.message : "An internal error occurred.",
    },
  };

  if (error instanceof ValidationError) {
    (body.error as Record<string, unknown>).fieldErrors = error.fieldErrors;
  }

  if (includeDetails && isAppError(error)) {
    (body.error as Record<string, unknown>).context = error.context;
  }

  return { body, status: error.status };
}
