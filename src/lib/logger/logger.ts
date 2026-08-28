import { formatErrorForLog, toAppError } from "@/lib/errors";
import { isProduction, isServer, isTest } from "@/lib/config/env";

/**
 * Structured logging.
 *
 * Development output is human-readable and colourised; production output is
 * newline-delimited JSON so a log aggregator can index it. Transports are
 * pluggable so an external sink can be attached without touching call sites.
 */

/** Severity of a log record, ordered from least to most severe. */
export type LogLevel = "debug" | "info" | "warn" | "error";

/** Numeric weight per level, used for threshold comparisons. */
const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

/** Structured data attached to a log record. */
export type LogContext = Record<string, unknown>;

/** A single structured log record. */
export interface LogRecord {
  readonly level: LogLevel;
  readonly message: string;
  readonly context: LogContext;
  readonly timestamp: string;
  /** Dotted namespace identifying the emitting module. */
  readonly scope: string;
  /** Present when the record was produced by {@link Logger.error}. */
  readonly error?: string;
}

/** Receives every record that passes the level threshold. */
export type LogTransport = (record: LogRecord) => void;

/** ANSI colour codes used by the development transport. */
const LEVEL_COLOR: Record<LogLevel, string> = {
  debug: "\u001b[90m",
  info: "\u001b[36m",
  warn: "\u001b[33m",
  error: "\u001b[31m",
};

const RESET = "\u001b[0m";

/**
 * Writes a colourised, human-readable line. Used outside production.
 *
 * @param record - The record to write.
 */
export const developmentTransport: LogTransport = (record) => {
  const color = isServer ? LEVEL_COLOR[record.level] : "";
  const reset = isServer ? RESET : "";
  const time = record.timestamp.slice(11, 23);
  const prefix = `${color}${record.level.toUpperCase().padEnd(5)}${reset} ${time} [${record.scope}]`;
  const hasContext = Object.keys(record.context).length > 0;

  const args: unknown[] = [`${prefix} ${record.message}`];
  if (hasContext) args.push(record.context);
  if (record.error) args.push(record.error);

  if (record.level === "error") {
    console.error(...args);
  } else if (record.level === "warn") {
    console.warn(...args);
  } else {
    console.log(...args);
  }
};

/**
 * Writes newline-delimited JSON. Used in production.
 *
 * @param record - The record to write.
 */
export const productionTransport: LogTransport = (record) => {
  const line = JSON.stringify(record);

  if (record.level === "error") {
    console.error(line);
  } else if (record.level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
};

/** Discards every record. Used under test. */
export const silentTransport: LogTransport = () => {};

/**
 * Picks the transport appropriate to the current environment.
 *
 * @returns The default transport.
 */
function resolveDefaultTransport(): LogTransport {
  if (isTest) return silentTransport;
  return isProduction ? productionTransport : developmentTransport;
}

/** Configuration for a {@link Logger}. */
export interface LoggerOptions {
  /** Dotted namespace identifying the emitting module. */
  readonly scope?: string;
  /** Minimum level to emit. Defaults to `debug` outside production, `info` in it. */
  readonly level?: LogLevel;
  /** Context merged into every record from this logger. */
  readonly context?: LogContext;
  /** Sinks receiving each record. Defaults to the environment transport. */
  readonly transports?: readonly LogTransport[];
}

/**
 * A scoped structured logger.
 *
 * Create child loggers with {@link Logger.child} so related records share a
 * scope and baseline context — for example a request ID threaded through an
 * entire API call.
 */
export class Logger {
  private readonly scope: string;
  private readonly level: LogLevel;
  private readonly baseContext: LogContext;
  private readonly transports: readonly LogTransport[];

  /** @param options - Scope, threshold, baseline context, and transports. */
  constructor(options: LoggerOptions = {}) {
    this.scope = options.scope ?? "app";
    this.level = options.level ?? (isProduction ? "info" : "debug");
    this.baseContext = options.context ?? {};
    this.transports = options.transports ?? [resolveDefaultTransport()];
  }

  /**
   * Creates a logger that inherits this one's settings.
   *
   * @param scope - Segment appended to the parent scope.
   * @param context - Additional baseline context.
   * @returns The child logger.
   */
  child(scope: string, context: LogContext = {}): Logger {
    return new Logger({
      scope: `${this.scope}.${scope}`,
      level: this.level,
      context: { ...this.baseContext, ...context },
      transports: this.transports,
    });
  }

  /**
   * Logs diagnostic detail useful only while developing.
   *
   * @param message - What happened.
   * @param context - Structured detail.
   */
  debug(message: string, context: LogContext = {}): void {
    this.write("debug", message, context);
  }

  /**
   * Logs a normal, noteworthy event.
   *
   * @param message - What happened.
   * @param context - Structured detail.
   */
  info(message: string, context: LogContext = {}): void {
    this.write("info", message, context);
  }

  /**
   * Logs a recoverable problem that deserves attention.
   *
   * @param message - What happened.
   * @param context - Structured detail.
   */
  warn(message: string, context: LogContext = {}): void {
    this.write("warn", message, context);
  }

  /**
   * Logs a failure, attaching a formatted error line when one is supplied.
   *
   * @param message - What happened.
   * @param error - The caught value.
   * @param context - Structured detail.
   */
  error(message: string, error?: unknown, context: LogContext = {}): void {
    const appError = error === undefined ? undefined : toAppError(error);

    this.write(
      "error",
      message,
      {
        ...context,
        ...(appError ? { errorCode: appError.code, errorStatus: appError.status } : {}),
      },
      error === undefined ? undefined : formatErrorForLog(error),
    );
  }

  /**
   * Emits a record if it meets the level threshold.
   *
   * @param level - Record severity.
   * @param message - What happened.
   * @param context - Structured detail.
   * @param error - Pre-formatted error line.
   */
  private write(level: LogLevel, message: string, context: LogContext, error?: string): void {
    if (LEVEL_WEIGHT[level] < LEVEL_WEIGHT[this.level]) return;

    const record: LogRecord = {
      level,
      message,
      context: { ...this.baseContext, ...context },
      timestamp: new Date().toISOString(),
      scope: this.scope,
      ...(error ? { error } : {}),
    };

    for (const transport of this.transports) {
      transport(record);
    }
  }
}

/** The application-wide logger. Prefer `logger.child(...)` in feature modules. */
export const logger = new Logger();

/**
 * Creates a scoped logger for a module.
 *
 * @param scope - Dotted namespace, e.g. `"api.client"`.
 * @param context - Baseline context merged into every record.
 * @returns The scoped logger.
 */
export function createLogger(scope: string, context: LogContext = {}): Logger {
  return logger.child(scope, context);
}
