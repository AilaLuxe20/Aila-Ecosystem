import {
  addDays,
  differenceInCalendarDays,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isValid,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import { DEFAULT_LOCALE, getDateFormatter, getRelativeTimeFormatter } from "./format";

/** Any value the platform accepts where a date is expected. */
export type DateInput = Date | string | number;

/** An inclusive range between two dates. */
export interface DateRange {
  readonly from: Date;
  readonly to: Date;
}

const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR = 3_600_000;
const MS_PER_DAY = 86_400_000;

/**
 * Coerces any supported input into a `Date`.
 *
 * @param value - ISO string, timestamp, or `Date`.
 * @returns The parsed date, or `null` when the input is not a valid date.
 */
export function toDate(value: DateInput | null | undefined): Date | null {
  if (value == null) return null;

  const parsed =
    value instanceof Date ? value : typeof value === "number" ? new Date(value) : parseISO(value);

  return isValid(parsed) ? parsed : null;
}

/**
 * Reports whether a value can be parsed into a valid date.
 *
 * @param value - Value to test.
 * @returns True when the value parses to a valid date.
 */
export function isValidDate(value: unknown): boolean {
  if (value instanceof Date) return isValid(value);
  if (typeof value === "string" || typeof value === "number") return toDate(value) !== null;
  return false;
}

/**
 * Formats a date using a `date-fns` pattern.
 *
 * @param value - Date to format.
 * @param pattern - `date-fns` format pattern. Defaults to `"d MMM yyyy"`.
 * @param fallback - Returned when the input cannot be parsed.
 * @returns The formatted date or the fallback.
 */
export function formatDate(
  value: DateInput | null | undefined,
  pattern = "d MMM yyyy",
  fallback = "—",
): string {
  const date = toDate(value);
  return date ? format(date, pattern) : fallback;
}

/**
 * Formats a date and time together.
 *
 * @param value - Date to format.
 * @param fallback - Returned when the input cannot be parsed.
 * @returns A string such as `4 Mar 2026, 14:30`.
 */
export function formatDateTime(value: DateInput | null | undefined, fallback = "—"): string {
  return formatDate(value, "d MMM yyyy, HH:mm", fallback);
}

/**
 * Formats only the time portion of a date.
 *
 * @param value - Date to format.
 * @param fallback - Returned when the input cannot be parsed.
 * @returns A string such as `14:30`.
 */
export function formatTime(value: DateInput | null | undefined, fallback = "—"): string {
  return formatDate(value, "HH:mm", fallback);
}

/**
 * Formats a date using locale-aware `Intl` options rather than a fixed pattern.
 *
 * @param value - Date to format.
 * @param options - `Intl.DateTimeFormat` options.
 * @param locale - BCP 47 locale tag.
 * @returns The localised date string, or an em dash when unparseable.
 */
export function formatDateLocalized(
  value: DateInput | null | undefined,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
  locale: string = DEFAULT_LOCALE,
): string {
  const date = toDate(value);
  return date ? getDateFormatter(locale, options).format(date) : "—";
}

/**
 * Describes a date relative to now, e.g. `3 hours ago` or `in 2 days`.
 *
 * @param value - Date to describe.
 * @param baseDate - Reference point. Defaults to the current time.
 * @param locale - BCP 47 locale tag.
 * @returns The relative description, or an em dash when unparseable.
 */
export function formatRelativeTime(
  value: DateInput | null | undefined,
  baseDate: Date = new Date(),
  locale: string = DEFAULT_LOCALE,
): string {
  const date = toDate(value);
  if (!date) return "—";

  const formatter = getRelativeTimeFormatter(locale);
  const deltaMs = date.getTime() - baseDate.getTime();
  const absMs = Math.abs(deltaMs);

  if (absMs < MS_PER_MINUTE) return formatter.format(Math.round(deltaMs / 1000), "second");
  if (absMs < MS_PER_HOUR) return formatter.format(Math.round(deltaMs / MS_PER_MINUTE), "minute");
  if (absMs < MS_PER_DAY) return formatter.format(Math.round(deltaMs / MS_PER_HOUR), "hour");

  const days = differenceInCalendarDays(date, baseDate);
  if (Math.abs(days) < 7) return formatter.format(days, "day");
  if (Math.abs(days) < 30) return formatter.format(Math.round(days / 7), "week");
  if (Math.abs(days) < 365) return formatter.format(Math.round(days / 30), "month");
  return formatter.format(Math.round(days / 365), "year");
}

/**
 * Serialises a date to an ISO 8601 string.
 *
 * @param value - Date to serialise.
 * @returns The ISO string, or `null` when unparseable.
 */
export function toISOString(value: DateInput | null | undefined): string | null {
  return toDate(value)?.toISOString() ?? null;
}

/**
 * Builds an inclusive date range spanning whole days.
 *
 * The order of the arguments does not matter — the earlier date becomes `from`.
 *
 * @param from - One end of the range.
 * @param to - The other end of the range.
 * @returns A normalised range from the start of the earlier day to the end of the later day.
 */
export function createDateRange(from: DateInput, to: DateInput): DateRange | null {
  const start = toDate(from);
  const end = toDate(to);
  if (!start || !end) return null;

  return isAfter(start, end)
    ? { from: startOfDay(end), to: endOfDay(start) }
    : { from: startOfDay(start), to: endOfDay(end) };
}

/**
 * Reports whether a date falls inside a range, inclusive of both bounds.
 *
 * @param value - Date to test.
 * @param range - Range to test against.
 * @returns True when the date is within the range.
 */
export function isWithinRange(value: DateInput, range: DateRange): boolean {
  const date = toDate(value);
  if (!date) return false;
  return !isBefore(date, range.from) && !isAfter(date, range.to);
}

/**
 * Builds the day grid for a month view, padded to whole weeks.
 *
 * Always returns six weeks (42 days) so the calendar does not change height
 * between months.
 *
 * @param month - Any date within the target month.
 * @param weekStartsOn - Day the week starts on, where 0 is Sunday. Defaults to Monday.
 * @returns 42 consecutive dates covering the month and its padding days.
 */
export function buildCalendarGrid(
  month: Date,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1,
): Date[] {
  const gridStart = startOfWeek(startOfMonth(month), { weekStartsOn });
  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
}

export {
  addDays,
  differenceInCalendarDays,
  endOfDay,
  endOfMonth,
  endOfWeek,
  isAfter,
  isBefore,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
};
