import { formatDuration } from "@/lib/utils/format";

import { createLogger, type LogContext } from "./logger";

/**
 * Performance instrumentation.
 *
 * Uses `performance.now()` where available so measurements are monotonic and
 * unaffected by wall-clock adjustments.
 */

const performanceLogger = createLogger("performance");

/** A completed timing measurement. */
export interface PerformanceMeasurement {
  readonly label: string;
  readonly durationMs: number;
  readonly context: LogContext;
}

/** Threshold above which a measurement is logged as a warning. */
export const SLOW_OPERATION_THRESHOLD_MS = 1_000;

/**
 * Returns a monotonic timestamp in milliseconds.
 *
 * @returns The current high-resolution time.
 */
export function now(): number {
  return typeof performance === "undefined" ? Date.now() : performance.now();
}

/**
 * Starts a timer.
 *
 * @param label - Name of the operation being measured.
 * @param context - Structured detail recorded alongside the measurement.
 * @returns A function that stops the timer, logs it, and returns the measurement.
 *
 * @example
 * const stop = startTimer("loadDashboard");
 * await loadDashboard();
 * stop();
 */
export function startTimer(
  label: string,
  context: LogContext = {},
): () => PerformanceMeasurement {
  const startedAt = now();

  return () => {
    const durationMs = now() - startedAt;
    const measurement: PerformanceMeasurement = { label, durationMs, context };

    const payload = { ...context, durationMs: Math.round(durationMs) };
    const message = `${label} took ${formatDuration(durationMs)}`;

    if (durationMs >= SLOW_OPERATION_THRESHOLD_MS) {
      performanceLogger.warn(message, payload);
    } else {
      performanceLogger.debug(message, payload);
    }

    return measurement;
  };
}

/**
 * Times an async operation and logs its duration.
 *
 * The timer stops even when the operation throws, so failures are measured too.
 *
 * @param label - Name of the operation.
 * @param operation - The work to measure.
 * @param context - Structured detail recorded alongside the measurement.
 * @returns The operation's resolved value.
 */
export async function measure<T>(
  label: string,
  operation: () => Promise<T>,
  context: LogContext = {},
): Promise<T> {
  const stop = startTimer(label, context);

  try {
    return await operation();
  } finally {
    stop();
  }
}

/**
 * Times a synchronous operation and logs its duration.
 *
 * @param label - Name of the operation.
 * @param operation - The work to measure.
 * @param context - Structured detail recorded alongside the measurement.
 * @returns The operation's return value.
 */
export function measureSync<T>(
  label: string,
  operation: () => T,
  context: LogContext = {},
): T {
  const stop = startTimer(label, context);

  try {
    return operation();
  } finally {
    stop();
  }
}

/**
 * Records a named mark on the browser performance timeline.
 *
 * No-ops on the server and in browsers without the User Timing API.
 *
 * @param name - Mark name.
 */
export function mark(name: string): void {
  if (typeof performance === "undefined" || typeof performance.mark !== "function") return;
  performance.mark(name);
}

/**
 * Measures between two marks on the browser performance timeline.
 *
 * @param name - Name given to the measurement.
 * @param startMark - Mark to measure from.
 * @param endMark - Mark to measure to. Defaults to now.
 * @returns The duration in milliseconds, or `null` when unavailable.
 */
export function measureBetween(
  name: string,
  startMark: string,
  endMark?: string,
): number | null {
  if (typeof performance === "undefined" || typeof performance.measure !== "function") {
    return null;
  }

  try {
    const entry = performance.measure(name, startMark, endMark);
    return entry.duration;
  } catch {
    return null;
  }
}
