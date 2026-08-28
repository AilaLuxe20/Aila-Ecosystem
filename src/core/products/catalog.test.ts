import assert from "node:assert/strict";
import { test } from "node:test";

import { ALL_PRODUCTS } from "@/core/constants";
import { PRODUCT_LIST, productKeyFromMode, PRODUCTS } from "./catalog";

test("every catalog product has a matching navigation href", () => {
  const hrefs = new Set<string>(ALL_PRODUCTS.map((product) => product.href));
  for (const product of PRODUCT_LIST) {
    assert.equal(hrefs.has(product.href), true, product.href);
  }
});

test("AI modes map back to catalog products", () => {
  assert.equal(productKeyFromMode("legal"), "ailalegal");
  assert.equal(productKeyFromMode("intelligence"), "intelligence");
  assert.equal(PRODUCTS.commerce.paid, true);
  assert.equal(PRODUCTS.intelligence.paid, false);
});
