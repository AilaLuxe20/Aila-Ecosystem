import { endOfDay, startOfDay } from "@/lib/utils/date";

import type { CalendarEventDto } from "./types";

/**
 * Reports whether an event overlaps a civil day in the viewer's local timezone.
 */
export function eventOverlapsDay(
  event: Pick<CalendarEventDto, "startsAt" | "endsAt">,
  day: Date,
): boolean {
  const dayStart = startOfDay(day).getTime();
  const dayEnd = endOfDay(day).getTime();
  const startsAt = new Date(event.startsAt).getTime();
  const endsAt = new Date(event.endsAt).getTime();

  if (Number.isNaN(startsAt) || Number.isNaN(endsAt)) {
    return false;
  }

  return startsAt <= dayEnd && endsAt >= dayStart;
}

export function eventsForDay(
  events: readonly CalendarEventDto[],
  day: Date,
): CalendarEventDto[] {
  return events
    .filter((event) => eventOverlapsDay(event, day))
    .sort(
      (left, right) =>
        new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime(),
    );
}
