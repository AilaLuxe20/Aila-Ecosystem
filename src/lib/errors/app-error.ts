/**
 * The platform's typed error hierarchy.
 *
 * Every error thrown by platform code extends {@link AppError}, which carries a
 * stable machine-readable `code`, an HTTP `status`, and a structured `context`.
 * This lets the API layer, the logger, and error boundaries all make decisions
 * from the error object alone rather than parsing messages.
 */

/** Stable, machine-readable error codes. Never renumber or reuse these. */
export const ERROR_CODES = {
  VALIDATION_FAILED: "VALIDATION_FAILED",
  UNAUTHENTICATED: "UNAUTHENTICATED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  RATE_LIMITED: "RATE_LIMITED",
  TIMEOUT: "TIMEOUT",
  NETWORK_ERROR: "NETWORK_ERROR",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",
  CONFIGURATION_ERROR: "CONFIGURATION_ERROR",
  ABORTED: "ABORTED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

/** A stable error code from {@link ERROR_CODES}. */
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/** How serious an error is, used to route logging and alerting. */
export type ErrorSeverity = "info" | "warning" | "error" | "fatal";

/** Arbitrary structured data attached to an error. */
export type ErrorContext = Record<string, unknown>;

/** Options accepted by every {@link AppError} subclass. */
export interface AppErrorOptions {
  /** Human-readable message safe to show to end users. */
  readonly message?: string;
  /** Structured diagnostic data. Never put secrets here. */
  readonly context?: ErrorContext;
  /** The underlying error, preserved for stack traces. */
  readonly cause?: unknown;
  /** Overrides the subclass default severity. */
  readonly severity?: ErrorSeverity;
}

/** The wire format produced by {@link AppError.toJSON}. */
export interface SerializedError {
  readonly name: string;
  readonly code: ErrorCode;
  readonly message: string;
  readonly status: number;
  readonly severity: ErrorSeverity;
  readonly context: ErrorContext;
  readonly timestamp: string;
}

/**
 * Base class for every error the platform raises deliberately.
 *
 * "Operational" errors are expected failures such as a bad request or a missing
 * record. Non-operational errors indicate a bug and should page someone.
 */
export class AppError extends Error {
  /** Stable machine-readable code. */
  readonly code: ErrorCode;
  /** HTTP status to return when this error reaches an API boundary. */
  readonly status: number;
  /** How serious this failure is. */
  readonly severity: ErrorSeverity;
  /** Structured diagnostic data. */
  readonly context: ErrorContext;
  /** True when this is an expected failure rather than a bug. */
  readonly isOperational: boolean;
  /** When the error was constructed. */
  readonly timestamp: Date;

  /**
   * Creates an application error.
   *
   * @param code - Stable machine-readable code.
   * @param status - HTTP status for API responses.
   * @param options - Message, context, cause, and severity overrides.
   * @param isOperational - Whether this is an expected failure. Defaults to true.
   */
  constructor(
    code: ErrorCode,
    status: number,
    options: AppErrorOptions = {},
    isOperational = true,
  ) {
    super(options.message ?? code, { cause: options.cause });

    this.name = new.target.name;
    this.code = code;
    this.status = status;
    this.severity = options.severity ?? (status >= 500 ? "error" : "warning");
    this.context = options.context ?? {};
    this.isOperational = isOperational;
    this.timestamp = new Date();

    Error.captureStackTrace?.(this, new.target);
  }

  /**
   * Serialises the error for logging or an API response body.
   *
   * @returns A JSON-safe representation. Never includes the stack or cause.
   */
  toJSON(): SerializedError {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      status: this.status,
      severity: this.severity,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
    };
  }

  /**
   * Returns a copy of this error with additional context merged in.
   *
   * @param context - Extra diagnostic data.
   * @returns A new error carrying the combined context.
   */
  withContext(context: ErrorContext): AppError {
    return new AppError(
      this.code,
      this.status,
      {
        message: this.message,
        context: { ...this.context, ...context },
        cause: this.cause,
        severity: this.severity,
      },
      this.isOperational,
    );
  }
}

/** A request failed schema validation. */
export class ValidationError extends AppError {
  /** Field-level messages keyed by dot path. */
  readonly fieldErrors: Readonly<Record<string, string>>;

  /**
   * @param fieldErrors - Field-level messages keyed by dot path.
   * @param options - Message, context, cause, and severity overrides.
   */
  constructor(fieldErrors: Record<string, string> = {}, options: AppErrorOptions = {}) {
    super(ERROR_CODES.VALIDATION_FAILED, 422, {
      message: options.message ?? "The submitted data is invalid.",
      ...options,
    });
    this.fieldErrors = fieldErrors;
  }

  /** @returns The serialised error including field-level messages. */
  override toJSON(): SerializedError & { fieldErrors: Record<string, string> } {
    return { ...super.toJSON(), fieldErrors: { ...this.fieldErrors } };
  }
}

/** The caller is not signed in. */
export class AuthenticationError extends AppError {
  /** @param options - Message, context, cause, and severity overrides. */
  constructor(options: AppErrorOptions = {}) {
    super(ERROR_CODES.UNAUTHENTICATED, 401, {
      message: options.message ?? "You must be signed in to continue.",
      ...options,
    });
  }
}

/** The caller is signed in but lacks permission. */
export class AuthorizationError extends AppError {
  /** @param options - Message, context, cause, and severity overrides. */
  constructor(options: AppErrorOptions = {}) {
    super(ERROR_CODES.FORBIDDEN, 403, {
      message: options.message ?? "You do not have access to this resource.",
      ...options,
    });
  }
}

/** The requested resource does not exist. */
export class NotFoundError extends AppError {
  /**
   * @param resource - Name of the missing resource, used in the default message.
   * @param options - Message, context, cause, and severity overrides.
   */
  constructor(resource = "Resource", options: AppErrorOptions = {}) {
    super(ERROR_CODES.NOT_FOUND, 404, {
      message: options.message ?? `${resource} was not found.`,
      ...options,
    });
  }
}

/** The request conflicts with current state, e.g. a duplicate key. */
export class ConflictError extends AppError {
  /** @param options - Message, context, cause, and severity overrides. */
  constructor(options: AppErrorOptions = {}) {
    super(ERROR_CODES.CONFLICT, 409, {
      message: options.message ?? "This action conflicts with the current state.",
      ...options,
    });
  }
}

/** The caller exceeded a rate limit. */
export class RateLimitError extends AppError {
  /** Seconds the caller should wait before retrying. */
  readonly retryAfterSeconds: number;

  /**
   * @param retryAfterSeconds - Seconds until the limit resets.
   * @param options - Message, context, cause, and severity overrides.
   */
  constructor(retryAfterSeconds = 60, options: AppErrorOptions = {}) {
    super(ERROR_CODES.RATE_LIMITED, 429, {
      message: options.message ?? "Too many requests. Please try again shortly.",
      ...options,
    });
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/** An operation exceeded its time budget. */
export class TimeoutError extends AppError {
  /** @param options - Message, context, cause, and severity overrides. */
  constructor(options: AppErrorOptions = {}) {
    super(ERROR_CODES.TIMEOUT, 408, {
      message: options.message ?? "The request timed out.",
      ...options,
    });
  }
}

/** The network request could not be completed. */
export class NetworkError extends AppError {
  /** @param options - Message, context, cause, and severity overrides. */
  constructor(options: AppErrorOptions = {}) {
    super(ERROR_CODES.NETWORK_ERROR, 503, {
      message: options.message ?? "A network error occurred. Check your connection.",
      ...options,
    });
  }
}

/** A downstream service returned an unusable response. */
export class ExternalServiceError extends AppError {
  /** Name of the failing service. */
  readonly service: string;

  /**
   * @param service - Name of the failing service.
   * @param options - Message, context, cause, and severity overrides.
   */
  constructor(service: string, options: AppErrorOptions = {}) {
    super(ERROR_CODES.EXTERNAL_SERVICE_ERROR, 502, {
      message: options.message ?? `${service} is currently unavailable.`,
      ...options,
    });
    this.service = service;
  }
}

/** Required configuration is missing or malformed. Never operational. */
export class ConfigurationError extends AppError {
  /** @param options - Message, context, cause, and severity overrides. */
  constructor(options: AppErrorOptions = {}) {
    super(
      ERROR_CODES.CONFIGURATION_ERROR,
      500,
      {
        message: options.message ?? "The application is misconfigured.",
        severity: "fatal",
        ...options,
      },
      false,
    );
  }
}

/** An in-flight operation was cancelled by the caller. */
export class AbortedError extends AppError {
  /** @param options - Message, context, cause, and severity overrides. */
  constructor(options: AppErrorOptions = {}) {
    super(ERROR_CODES.ABORTED, 499, {
      message: options.message ?? "The operation was cancelled.",
      severity: "info",
      ...options,
    });
  }
}

/** An unexpected failure. Always non-operational. */
export class InternalError extends AppError {
  /** @param options - Message, context, cause, and severity overrides. */
  constructor(options: AppErrorOptions = {}) {
    super(
      ERROR_CODES.INTERNAL_ERROR,
      500,
      {
        message: options.message ?? "Something went wrong on our end.",
        severity: "error",
        ...options,
      },
      false,
    );
  }
}

/**
 * Narrows an unknown value to an {@link AppError}.
 *
 * @param value - Value to test.
 * @returns True when the value is an `AppError`.
 */
export function isAppError(value: unknown): value is AppError {
  return value instanceof AppError;
}

/**
 * Narrows an unknown value to a native `Error`.
 *
 * @param value - Value to test.
 * @returns True when the value is an `Error`.
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * Reports whether an error represents an expected, handled failure.
 *
 * Non-operational errors indicate a bug and warrant an alert.
 *
 * @param value - Value to test.
 * @returns True when the error is operational.
 */
export function isOperationalError(value: unknown): boolean {
  return isAppError(value) && value.isOperational;
}

/**
 * Converts any thrown value into an {@link AppError}.
 *
 * Recognises `AbortError` from `AbortController` and native `TypeError` from
 * `fetch` so callers get a meaningful subclass rather than a generic wrapper.
 *
 * @param value - The caught value.
 * @param fallbackMessage - Message used when none can be derived.
 * @returns An `AppError` describing the failure.
 */
export function toAppError(value: unknown, fallbackMessage?: string): AppError {
  if (isAppError(value)) return value;

  if (isError(value)) {
    if (value.name === "AbortError") {
      return new AbortedError({ cause: value });
    }

    if (value.name === "TypeError" && /fetch/i.test(value.message)) {
      return new NetworkError({ cause: value, context: { originalMessage: value.message } });
    }

    return new InternalError({
      message: fallbackMessage ?? value.message,
      cause: value,
      context: { originalName: value.name },
    });
  }

  return new InternalError({
    message: fallbackMessage ?? "An unexpected error occurred.",
    context: { thrownValue: typeof value === "string" ? value : JSON.stringify(value) },
  });
}
