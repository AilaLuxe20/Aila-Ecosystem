import assert from "node:assert/strict";
import { test } from "node:test";

import { createWriterDocumentSchema, rewriteWriterDocumentSchema } from "./schema";

test("writer documents require a title", () => {
  assert.equal(createWriterDocumentSchema.safeParse({ title: "", body: "Hi" }).success, false);
  assert.equal(createWriterDocumentSchema.safeParse({ title: "Notes", body: "Hi" }).success, true);
});

test("rewrite requires instruction and body", () => {
  assert.equal(rewriteWriterDocumentSchema.safeParse({ instruction: "shorten", body: "" }).success, false);
  assert.equal(
    rewriteWriterDocumentSchema.safeParse({ instruction: "shorten", body: "Long draft" }).success,
    true,
  );
});
