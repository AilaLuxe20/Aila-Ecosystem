import assert from "node:assert/strict";
import { test } from "node:test";

import { createCommerceOrderSchema, createCommerceProductSchema } from "./schema";

test("product schema converts a zero price", () => {
  const parsed = createCommerceProductSchema.safeParse({ name: "Sample", priceCents: 0 });
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.currency, "usd");
    assert.equal(parsed.data.active, true);
  }
});

test("product schema rejects a negative price", () => {
  const parsed = createCommerceProductSchema.safeParse({ name: "Sample", priceCents: -1 });
  assert.equal(parsed.success, false);
});

test("order schema requires a product and customer", () => {
  const parsed = createCommerceOrderSchema.safeParse({
    productId: "abc",
    customerName: "Ada",
    customerEmail: "ada@example.com",
  });
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.quantity, 1);
  }
});
