import assert from "node:assert/strict";
import { test } from "node:test";

import { createHealthHabitSchema, createHealthLogSchema, updateHealthHabitSchema } from "./schema";

test("habits require a name and a known cadence", () => {
  assert.equal(createHealthHabitSchema.safeParse({ name: "", cadence: "daily" }).success, false);
  assert.equal(createHealthHabitSchema.safeParse({ name: "Walk", cadence: "hourly" }).success, false);
  const parsed = createHealthHabitSchema.safeParse({ name: "Walk", cadence: "daily" });
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.notes, null);
  }
});

test("logs accept wellness kinds only", () => {
  assert.equal(
    createHealthLogSchema.safeParse({ kind: "diagnosis", title: "Note" }).success,
    false,
  );
  const parsed = createHealthLogSchema.safeParse({
    kind: "mood",
    title: "Tired",
    body: "Slept late",
  });
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.done, false);
  }
});

test("habit updates need at least one field", () => {
  assert.equal(updateHealthHabitSchema.safeParse({}).success, false);
  assert.equal(updateHealthHabitSchema.safeParse({ cadence: "weekly" }).success, true);
});
