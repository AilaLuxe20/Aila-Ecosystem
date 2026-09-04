import assert from "node:assert/strict";
import { test } from "node:test";

import { resolveAdsPlan, utcDay } from "./plan";

test("staff roles map to business or enterprise Ads plans", () => {
  assert.equal(resolveAdsPlan("user", false), "free");
  assert.equal(resolveAdsPlan("user", true), "pro");
  assert.equal(resolveAdsPlan("pro", false), "pro");
  assert.equal(resolveAdsPlan("business", false), "business");
  assert.equal(resolveAdsPlan("enterprise", false), "enterprise");
  assert.equal(resolveAdsPlan("admin", false), "enterprise");
});

test("utcDay is midnight UTC", () => {
  const day = utcDay(new Date("2026-08-29T15:04:00.000Z"));
  assert.equal(day.toISOString(), "2026-08-29T00:00:00.000Z");
});
