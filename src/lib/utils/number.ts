/**
 * Numeric helpers used by sliders, progress indicators, charts, and pagination.
 */

/**
 * Constrains a value to an inclusive range.
 *
 * @param value - Value to constrain.
 * @param min - Lower bound.
 * @param max - Upper bound.
 * @returns The clamped value.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Rounds a value to the nearest multiple of a step, anchored at `min`.
 *
 * @param value - Value to snap.
 * @param step - Step size. Values of zero or less return the input unchanged.
 * @param min - Anchor the steps start from. Defaults to 0.
 * @returns The snapped value.
 */
export function roundToStep(value: number, step: number, min = 0): number {
  if (step <= 0) return value;
  return min + Math.round((value - min) / step) * step;
}

/**
 * Linearly interpolates between two values.
 *
 * @param start - Value returned at `amount = 0`.
 * @param end - Value returned at `amount = 1`.
 * @param amount - Interpolation factor, clamped to `[0, 1]`.
 * @returns The interpolated value.
 */
export function lerp(start: number, end: number, amount: number): number {
  return start + (end - start) * clamp(amount, 0, 1);
}

/**
 * Converts a value within a range to a `0–1` fraction.
 *
 * @param value - Value to normalise.
 * @param min - Range minimum.
 * @param max - Range maximum.
 * @returns The normalised fraction, clamped to `[0, 1]`.
 */
export function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return clamp((value - min) / (max - min), 0, 1);
}

/**
 * Rounds to a fixed number of decimal places without string conversion.
 *
 * @param value - Value to round.
 * @param decimals - Decimal places to keep. Defaults to 2.
 * @returns The rounded number.
 */
export function roundTo(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Calculates what percentage `value` is of `total`.
 *
 * @param value - Portion.
 * @param total - Whole. A total of zero yields 0.
 * @returns The percentage, clamped to `[0, 100]`.
 */
export function percentage(value: number, total: number): number {
  if (total === 0) return 0;
  return clamp((value / total) * 100, 0, 100);
}

/**
 * Reports whether a value is a usable finite number.
 *
 * @param value - Value to test.
 * @returns True for finite numbers, false for `NaN`, infinities, and non-numbers.
 */
export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Parses a value into a number, returning a fallback when unusable.
 *
 * @param value - Value to coerce.
 * @param fallback - Returned when parsing fails. Defaults to 0.
 * @returns The parsed number or the fallback.
 */
export function toNumber(value: unknown, fallback = 0): number {
  if (isFiniteNumber(value)) return value;

  if (typeof value === "string") {
    const parsed = Number(value.replace(/[\s,]/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }

  return fallback;
}

/**
 * Counts the decimal places in a number.
 *
 * @param value - Value to inspect.
 * @returns The number of digits after the decimal point.
 */
export function decimalPlaces(value: number): number {
  if (Number.isInteger(value)) return 0;
  const text = String(value);
  const separatorIndex = text.indexOf(".");
  return separatorIndex === -1 ? 0 : text.length - separatorIndex - 1;
}

/**
 * Computes the arithmetic mean of a list of numbers.
 *
 * @param values - Values to average.
 * @returns The mean, or 0 for an empty list.
 */
export function mean(values: readonly number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

/**
 * Computes the median of a list of numbers.
 *
 * @param values - Values to inspect.
 * @returns The median, or 0 for an empty list.
 */
export function median(values: readonly number[]): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}
