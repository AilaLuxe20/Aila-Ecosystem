import type { CalendarEventRecord } from "./types";

export function canAccessCalendarEvent(
  record: Pick<CalendarEventRecord, "userId">,
  userId: string,
): boolean {
  return record.userId === userId;
}
