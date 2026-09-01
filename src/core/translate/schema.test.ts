import assert from "node:assert/strict";
import { test } from "node:test";

import { createTranslateSchema, listTranslateQuerySchema } from "./schema";

test("translate requires languages and source text", () => {
  assert.equal(
    createTranslateSchema.safeParse({ sourceLang: "e", targetLang: "es", sourceText: "Hello" }).success,
    false,
  );
  assert.equal(
    createTranslateSchema.safeParse({ sourceLang: "en", targetLang: "es", sourceText: "" }).success,
    false,
  );
  assert.equal(
    createTranslateSchema.safeParse({ sourceLang: "en", targetLang: "es", sourceText: "Hello" }).success,
    true,
  );
});

test("translate list query accepts optional q", () => {
  assert.equal(listTranslateQuerySchema.safeParse({}).success, true);
  assert.equal(listTranslateQuerySchema.safeParse({ q: "bonjour" }).success, true);
  assert.equal(listTranslateQuerySchema.safeParse({ q: "x", extra: true }).success, false);
});
