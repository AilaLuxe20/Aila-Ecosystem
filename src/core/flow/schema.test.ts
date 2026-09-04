import assert from "node:assert/strict";
import { test } from "node:test";

import { createFlowSchema } from "./schema";

test("flow schema requires steps", () => {
  const parsed = createFlowSchema.safeParse({ name: "Launch", steps: [] });
  assert.equal(parsed.success, false);
});

test("flow schema accepts named steps", () => {
  const parsed = createFlowSchema.safeParse({
    name: "Launch",
    steps: [{ title: "Research" }, { title: "Ship" }],
  });
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.steps[0]?.status, "pending");
  }
});
