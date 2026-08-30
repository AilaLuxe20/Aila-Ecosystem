import assert from "node:assert/strict";
import { test } from "node:test";

import { trialDaysRemaining, trialEndFromUnix } from "./trial";

test("remaining trial days are computed from a stored end date", () => {
  const now = new Date("2026-08-30T00:00:00.000Z");
  const end = new Date("2026-09-03T00:00:00.000Z");
  assert.equal(trialDaysRemaining(end, now), 4);
  assert.equal(trialDaysRemaining(new Date("2026-08-29T00:00:00.000Z"), now), 0);
  assert.equal(trialDaysRemaining(null, now), null);
});

test("unix trial_end converts to a Date", () => {
  const seconds = Date.parse("2026-08-30T00:00:00.000Z") / 1000;
  assert.equal(trialEndFromUnix(seconds)?.toISOString(), "2026-08-30T00:00:00.000Z");
});
