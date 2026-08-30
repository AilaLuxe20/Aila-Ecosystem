import assert from "node:assert/strict";
import { test } from "node:test";

import {
  calendarDateInZone,
  dateOverlapsCivilDay,
  isOnCivilDay,
  isValidTimeZone,
} from "./timezone";

test("accepts IANA timezones and rejects junk", () => {
  assert.equal(isValidTimeZone("Africa/Lagos"), true);
  assert.equal(isValidTimeZone("UTC"), true);
  assert.equal(isValidTimeZone("Not/AZone"), false);
});

test("civil date follows the requested timezone", () => {
  const date = new Date("2026-08-30T01:00:00.000Z");
  assert.equal(calendarDateInZone(date, "UTC"), "2026-08-30");
  assert.equal(calendarDateInZone(date, "America/Los_Angeles"), "2026-08-29");
});

test("event overlap uses civil dates in the viewer timezone", () => {
  const start = new Date("2026-08-30T08:00:00.000Z");
  const end = new Date("2026-08-30T09:00:00.000Z");
  assert.equal(dateOverlapsCivilDay(start, end, "2026-08-30", "UTC"), true);
  assert.equal(isOnCivilDay(start, "2026-08-30", "UTC"), true);
});
