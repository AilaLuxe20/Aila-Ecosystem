import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createCalendarEventSchema,
  listCalendarEventsQuerySchema,
  updateCalendarEventSchema,
} from "./schema";

const validCreate = {
  title: "Team planning",
  startsAt: "2026-08-28T09:00:00.000Z",
  endsAt: "2026-08-28T10:00:00.000Z",
};

test("create schema accepts a valid event", () => {
  const parsed = createCalendarEventSchema.safeParse(validCreate);
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.allDay, false);
    assert.equal(parsed.data.timezone, "UTC");
    assert.equal(parsed.data.description, null);
  }
});

test("create schema rejects an empty title", () => {
  const parsed = createCalendarEventSchema.safeParse({
    ...validCreate,
    title: "   ",
  });
  assert.equal(parsed.success, false);
});

test("create schema rejects unknown fields", () => {
  const parsed = createCalendarEventSchema.safeParse({
    ...validCreate,
    userId: "someone-else",
  });
  assert.equal(parsed.success, false);
});

test("create schema rejects an end that is not after start", () => {
  const parsed = createCalendarEventSchema.safeParse({
    ...validCreate,
    endsAt: validCreate.startsAt,
  });
  assert.equal(parsed.success, false);
});

test("create schema rejects events longer than 366 days", () => {
  const parsed = createCalendarEventSchema.safeParse({
    ...validCreate,
    endsAt: "2028-08-28T10:00:00.000Z",
  });
  assert.equal(parsed.success, false);
});

test("update schema requires at least one field", () => {
  const parsed = updateCalendarEventSchema.safeParse({});
  assert.equal(parsed.success, false);
});

test("update schema with only archived does not invent text fields", () => {
  const parsed = updateCalendarEventSchema.safeParse({ archived: true });
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.description, undefined);
    assert.equal(parsed.data.location, undefined);
    assert.equal(parsed.data.title, undefined);
  }
});

test("list query rejects inverted ranges", () => {
  const parsed = listCalendarEventsQuerySchema.safeParse({
    from: "2026-08-28T00:00:00.000Z",
    to: "2026-08-01T00:00:00.000Z",
  });
  assert.equal(parsed.success, false);
});

test("list query defaults status to active", () => {
  const parsed = listCalendarEventsQuerySchema.safeParse({});
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.status, "active");
  }
});
