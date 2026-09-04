import assert from "node:assert/strict";
import { test } from "node:test";

import { listDocumentsQuerySchema, updateDocumentNotesSchema } from "./schema";

test("documents notes update requires notes", () => {
  assert.equal(updateDocumentNotesSchema.safeParse({}).success, false);
  assert.equal(updateDocumentNotesSchema.safeParse({ notes: "Remember this clause" }).success, true);
  assert.equal(updateDocumentNotesSchema.safeParse({ notes: null }).success, true);
});

test("documents list query accepts optional q", () => {
  assert.equal(listDocumentsQuerySchema.safeParse({}).success, true);
  assert.equal(listDocumentsQuerySchema.safeParse({ q: "invoice" }).success, true);
  assert.equal(listDocumentsQuerySchema.safeParse({ q: "x", extra: true }).success, false);
});
