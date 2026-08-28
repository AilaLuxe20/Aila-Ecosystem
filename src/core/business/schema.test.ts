import assert from "node:assert/strict";
import { test } from "node:test";

import { createBusinessContactSchema, createBusinessTaskSchema } from "./schema";

test("contact schema accepts a named lead", () => {
  const parsed = createBusinessContactSchema.safeParse({ name: "Ada" });
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.status, "lead");
    assert.equal(parsed.data.email, null);
  }
});

test("contact schema rejects an unknown field", () => {
  const parsed = createBusinessContactSchema.safeParse({ name: "Ada", userId: "x" });
  assert.equal(parsed.success, false);
});

test("task schema requires a title", () => {
  const parsed = createBusinessTaskSchema.safeParse({ title: "   " });
  assert.equal(parsed.success, false);
});
