import assert from "node:assert/strict";
import { test } from "node:test";

import { parseJsonObject } from "./json";

test("parseJsonObject reads a fenced object", () => {
  const parsed = parseJsonObject('```json\n{"headline":"Hello"}\n```');
  assert.equal(parsed.headline, "Hello");
});

test("parseJsonObject rejects arrays", () => {
  assert.throws(() => parseJsonObject("[1]"));
});
