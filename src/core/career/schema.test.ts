import assert from "node:assert/strict";
import { test } from "node:test";

import { createCareerApplicationSchema, createCareerResumeSchema } from "./schema";

test("career resume requires a title", () => {
  assert.equal(createCareerResumeSchema.safeParse({ title: "" }).success, false);
  assert.equal(createCareerResumeSchema.safeParse({ title: "Product designer" }).success, true);
});

test("career resume defaults to draft", () => {
  const parsed = createCareerResumeSchema.safeParse({ title: "Product designer" });
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.status, "draft");
    assert.equal(parsed.data.summary, "");
  }
});

test("career application requires company and role", () => {
  assert.equal(createCareerApplicationSchema.safeParse({ company: "Aila", role: "" }).success, false);
  assert.equal(
    createCareerApplicationSchema.safeParse({ company: "Aila", role: "Engineer" }).success,
    true,
  );
});

test("career application rejects an unknown status", () => {
  assert.equal(
    createCareerApplicationSchema.safeParse({
      company: "Aila",
      role: "Engineer",
      status: "ghosted",
    }).success,
    false,
  );
});
