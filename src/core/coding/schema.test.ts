import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createCodingProjectSchema,
  explainCodingFileSchema,
  updateCodingProjectSchema,
} from "./schema";

test("coding project requires a name and language", () => {
  assert.equal(createCodingProjectSchema.safeParse({ name: "", language: "typescript" }).success, false);
  assert.equal(
    createCodingProjectSchema.safeParse({ name: "Notes app", language: "typescript" }).success,
    true,
  );
});

test("coding project rejects an unknown language", () => {
  assert.equal(
    createCodingProjectSchema.safeParse({ name: "Notes app", language: "brainfuck" }).success,
    false,
  );
});

test("coding update requires at least one field", () => {
  assert.equal(updateCodingProjectSchema.safeParse({}).success, false);
  assert.equal(updateCodingProjectSchema.safeParse({ name: "Renamed" }).success, true);
});

test("explain requires a file id", () => {
  assert.equal(explainCodingFileSchema.safeParse({ fileId: "" }).success, false);
  assert.equal(explainCodingFileSchema.safeParse({ fileId: "file_1" }).success, true);
});
