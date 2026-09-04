import assert from "node:assert/strict";
import { test } from "node:test";

import { normalizeOptionalEnvValue } from "./env";

test("normalizeOptionalEnvValue trims whitespace and quotes", () => {
  assert.equal(normalizeOptionalEnvValue("  sk-or-v1-test  "), "sk-or-v1-test");
  assert.equal(normalizeOptionalEnvValue('"sk-or-v1-test"'), "sk-or-v1-test");
  assert.equal(normalizeOptionalEnvValue("'sk-or-v1-test'"), "sk-or-v1-test");
  assert.equal(normalizeOptionalEnvValue('"sk-or-v1-test'), "sk-or-v1-test");
  assert.equal(normalizeOptionalEnvValue("sk-or-v1-test'"), "sk-or-v1-test");
  assert.equal(normalizeOptionalEnvValue("   "), undefined);
  assert.equal(normalizeOptionalEnvValue(""), undefined);
});
