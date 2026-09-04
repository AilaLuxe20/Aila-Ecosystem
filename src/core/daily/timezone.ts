/**
 * Civil-date helpers that honour an IANA timezone instead of the server clock.
 */

export function isValidTimeZone(value: string): boolean {
  if (!value || value.length > 64) {
    return false;
  }

  try {
    Intl.DateTimeFormat("en-US", { timeZone: value }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

export function calendarDateInZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function dateOverlapsCivilDay(
  start: Date,
  end: Date,
  civilDate: string,
  timeZone: string,
): boolean {
  const startDay = calendarDateInZone(start, timeZone);
  const endDay = calendarDateInZone(end, timeZone);
  return startDay <= civilDate && endDay >= civilDate;
}

export function isOnOrBeforeCivilDay(
  value: Date,
  civilDate: string,
  timeZone: string,
): boolean {
  return calendarDateInZone(value, timeZone) <= civilDate;
}

export function isOnCivilDay(value: Date, civilDate: string, timeZone: string): boolean {
  return calendarDateInZone(value, timeZone) === civilDate;
}
