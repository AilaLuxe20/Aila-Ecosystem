import assert from "node:assert/strict";
import { test } from "node:test";

import { canAccessCalendarEvent } from "./ownership";
import { eventOverlapsDay, eventsForDay } from "./range";
import { serializeCalendarEvent } from "./service";
import type { CalendarEventDto, CalendarEventRecord } from "./types";

test("ownership rejects a different user", () => {
  assert.equal(canAccessCalendarEvent({ userId: "user-a" }, "user-a"), true);
  assert.equal(canAccessCalendarEvent({ userId: "user-a" }, "user-b"), false);
});

test("serializeCalendarEvent never includes userId", () => {
  const record: CalendarEventRecord = {
    id: "evt_1",
    userId: "user-a",
    title: "Planning",
    description: null,
    location: "Office",
    startsAt: new Date("2026-08-28T09:00:00.000Z"),
    endsAt: new Date("2026-08-28T10:00:00.000Z"),
    allDay: false,
    timezone: "UTC",
    archivedAt: null,
    createdAt: new Date("2026-08-28T08:00:00.000Z"),
    updatedAt: new Date("2026-08-28T08:00:00.000Z"),
  };

  const dto = serializeCalendarEvent(record);
  assert.equal("userId" in dto, false);
  assert.equal(dto.startsAt, "2026-08-28T09:00:00.000Z");
  assert.equal(dto.archivedAt, null);
});

test("eventOverlapsDay includes events that span the day", () => {
  const event: Pick<CalendarEventDto, "startsAt" | "endsAt"> = {
    startsAt: new Date(2026, 7, 27, 22, 0, 0).toISOString(),
    endsAt: new Date(2026, 7, 28, 2, 0, 0).toISOString(),
  };

  assert.equal(eventOverlapsDay(event, new Date(2026, 7, 27, 12, 0, 0)), true);
  assert.equal(eventOverlapsDay(event, new Date(2026, 7, 28, 12, 0, 0)), true);
  assert.equal(eventOverlapsDay(event, new Date(2026, 7, 29, 12, 0, 0)), false);
});

test("eventsForDay sorts by start time", () => {
  const day = new Date(2026, 7, 28, 12, 0, 0);
  const events: CalendarEventDto[] = [
    {
      id: "later",
      title: "Later",
      description: null,
      location: null,
      startsAt: new Date(2026, 7, 28, 15, 0, 0).toISOString(),
      endsAt: new Date(2026, 7, 28, 16, 0, 0).toISOString(),
      allDay: false,
      timezone: "UTC",
      archivedAt: null,
      createdAt: new Date(2026, 7, 28, 8, 0, 0).toISOString(),
      updatedAt: new Date(2026, 7, 28, 8, 0, 0).toISOString(),
    },
    {
      id: "earlier",
      title: "Earlier",
      description: null,
      location: null,
      startsAt: new Date(2026, 7, 28, 9, 0, 0).toISOString(),
      endsAt: new Date(2026, 7, 28, 10, 0, 0).toISOString(),
      allDay: false,
      timezone: "UTC",
      archivedAt: null,
      createdAt: new Date(2026, 7, 28, 8, 0, 0).toISOString(),
      updatedAt: new Date(2026, 7, 28, 8, 0, 0).toISOString(),
    },
  ];

  assert.deepEqual(
    eventsForDay(events, day).map((event) => event.id),
    ["earlier", "later"],
  );
});
