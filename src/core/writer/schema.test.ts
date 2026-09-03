import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createWriterBookSchema,
  createWriterDocumentSchema,
  generateWriterSchema,
  rewriteWriterDocumentSchema,
} from "./schema";

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

test("book projects require a title", () => {
  assert.equal(createWriterBookSchema.safeParse({ title: "" }).success, false);
  assert.equal(createWriterBookSchema.safeParse({ title: "Whispers" }).success, true);
});

test("generate actions require a book and a known action", () => {
  assert.equal(
    generateWriterSchema.safeParse({ action: "generate_scene", bookId: "book_1", chapterId: "ch_1" }).success,
    true,
  );
  assert.equal(
    generateWriterSchema.safeParse({ action: "invent_plot", bookId: "book_1" }).success,
    false,
  );
});
