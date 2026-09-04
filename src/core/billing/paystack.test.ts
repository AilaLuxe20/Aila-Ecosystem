import assert from "node:assert/strict";
import { test } from "node:test";

import { verifyPaystackSignature, parsePaystackMetadata } from "./paystack";

test("parsePaystackMetadata reads string and object metadata", () => {
  assert.deepEqual(parsePaystackMetadata({ userId: "user_1", interval: "monthly" }), {
    userId: "user_1",
    interval: "monthly",
  });
  assert.deepEqual(
    parsePaystackMetadata(JSON.stringify({ userId: "user_2", planCode: "PLN_x" })),
    { userId: "user_2", planCode: "PLN_x" },
  );
  assert.deepEqual(parsePaystackMetadata(null), {});
});

test("verifyPaystackSignature rejects missing signature without throwing", () => {
  assert.equal(verifyPaystackSignature("{}", null), false);
  assert.equal(verifyPaystackSignature("{}", ""), false);
});
