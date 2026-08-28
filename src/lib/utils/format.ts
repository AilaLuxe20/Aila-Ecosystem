/**
 * Locale-aware display formatting.
 *
 * Formatter instances are cached because constructing `Intl` objects is one of
 * the more expensive operations in a render path.
 */

/** Default locale used when a caller does not specify one. */
export const DEFAULT_LOCALE = "en-US";

const numberFormatters = new Map<string, Intl.NumberFormat>();
const dateFormatters = new Map<string, Intl.DateTimeFormat>();
const relativeFormatters = new Map<string, Intl.RelativeTimeFormat>();

/**
 * Returns a cached `Intl.NumberFormat` for the given locale and options.
 *
 * @param locale - BCP 47 locale tag.
 * @param options - Number formatting options.
 * @returns A shared formatter instance.
 */
export function getNumberFormatter(
  locale: string = DEFAULT_LOCALE,
  options: Intl.NumberFormatOptions = {},
): Intl.NumberFormat {
  const key = `${locale}:${JSON.stringify(options)}`;
  let formatter = numberFormatters.get(key);

  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    numberFormatters.set(key, formatter);
  }

  return formatter;
}

/**
 * Returns a cached `Intl.DateTimeFormat` for the given locale and options.
 *
 * @param locale - BCP 47 locale tag.
 * @param options - Date formatting options.
 * @returns A shared formatter instance.
 */
export function getDateFormatter(
  locale: string = DEFAULT_LOCALE,
  options: Intl.DateTimeFormatOptions = {},
): Intl.DateTimeFormat {
  const key = `${locale}:${JSON.stringify(options)}`;
  let formatter = dateFormatters.get(key);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    dateFormatters.set(key, formatter);
  }

  return formatter;
}

/**
 * Returns a cached `Intl.RelativeTimeFormat` for the given locale.
 *
 * @param locale - BCP 47 locale tag.
 * @returns A shared formatter instance.
 */
export function getRelativeTimeFormatter(locale: string = DEFAULT_LOCALE): Intl.RelativeTimeFormat {
  let formatter = relativeFormatters.get(locale);

  if (!formatter) {
    formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    relativeFormatters.set(locale, formatter);
  }

  return formatter;
}

/**
 * Formats a number with locale-aware grouping.
 *
 * @param value - Number to format.
 * @param options - Optional `Intl.NumberFormat` overrides.
 * @param locale - BCP 47 locale tag.
 * @returns The formatted string.
 */
export function formatNumber(
  value: number,
  options: Intl.NumberFormatOptions = {},
  locale: string = DEFAULT_LOCALE,
): string {
  return getNumberFormatter(locale, options).format(value);
}

/**
 * Formats a fraction as a percentage.
 *
 * @param value - Fraction where `0.42` renders as `42%`.
 * @param decimals - Decimal places to display. Defaults to 0.
 * @param locale - BCP 47 locale tag.
 * @returns The formatted percentage.
 */
export function formatPercent(
  value: number,
  decimals = 0,
  locale: string = DEFAULT_LOCALE,
): string {
  return formatNumber(
    value,
    {
      style: "percent",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    },
    locale,
  );
}

/**
 * Abbreviates large numbers using compact notation, e.g. `12.4K`.
 *
 * @param value - Number to abbreviate.
 * @param locale - BCP 47 locale tag.
 * @returns The compact representation.
 */
export function formatCompact(value: number, locale: string = DEFAULT_LOCALE): string {
  return formatNumber(
    value,
    { notation: "compact", maximumFractionDigits: 1 },
    locale,
  );
}

/**
 * Formats a byte count using binary units.
 *
 * @param bytes - Size in bytes.
 * @param decimals - Decimal places to display. Defaults to 1.
 * @returns A human-readable size such as `1.4 MB`.
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB", "PB"] as const;
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const size = bytes / 1024 ** exponent;

  return `${size.toFixed(exponent === 0 ? 0 : decimals)} ${units[exponent]}`;
}

/**
 * Formats a millisecond duration as a compact human-readable string.
 *
 * @param milliseconds - Duration in milliseconds.
 * @returns A string such as `1h 12m` or `450ms`.
 */
export function formatDuration(milliseconds: number): string {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) return "0ms";
  if (milliseconds < 1000) return `${Math.round(milliseconds)}ms`;

  const totalSeconds = Math.floor(milliseconds / 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600) % 24;
  const days = Math.floor(totalSeconds / 86400);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

/**
 * Formats a list into natural language, e.g. `A, B, and C`.
 *
 * @param items - Items to join.
 * @param type - Whether the final conjunction is "and" or "or".
 * @param locale - BCP 47 locale tag.
 * @returns The formatted list.
 */
export function formatList(
  items: readonly string[],
  type: "conjunction" | "disjunction" = "conjunction",
  locale: string = DEFAULT_LOCALE,
): string {
  return new Intl.ListFormat(locale, { style: "long", type }).format(items);
}

/**
 * Formats an ordinal number, e.g. `1st`, `22nd`.
 *
 * @param value - Integer to format.
 * @param locale - BCP 47 locale tag.
 * @returns The ordinal string.
 */
export function formatOrdinal(value: number, locale: string = DEFAULT_LOCALE): string {
  const rules = new Intl.PluralRules(locale, { type: "ordinal" });
  const suffixes: Record<Intl.LDMLPluralRule, string> = {
    zero: "th",
    one: "st",
    two: "nd",
    few: "rd",
    many: "th",
    other: "th",
  };

  return `${value}${suffixes[rules.select(value)]}`;
}
