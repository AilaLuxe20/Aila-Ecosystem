import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createDailyGoalSchema,
  createDailyNoteSchema,
  createDailyTaskSchema,
  dailyWorkspaceQuerySchema,
} from "./schema";

test("workspace query defaults timezone to UTC", () => {
  const parsed = dailyWorkspaceQuerySchema.safeParse({});
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.timezone, "UTC");
  }
});

test("workspace query rejects an invalid timezone", () => {
  const parsed = dailyWorkspaceQuerySchema.safeParse({ timezone: "Nope/City" });
  assert.equal(parsed.success, false);
});

test("note and goal schemas require a title", () => {
  assert.equal(createDailyNoteSchema.safeParse({ title: "", body: "x" }).success, false);
  assert.equal(createDailyGoalSchema.safeParse({ title: "Ship Daily" }).success, true);
  assert.equal(createDailyTaskSchema.safeParse({ title: "Write brief" }).success, true);
});
