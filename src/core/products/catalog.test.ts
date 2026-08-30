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
  assert.equal(productKeyFromMode("daily"), "daily");
  assert.equal(PRODUCTS.commerce.paid, true);
  assert.equal(PRODUCTS.intelligence.paid, false);
  assert.equal(PRODUCTS.daily.paid, false);
  assert.equal(PRODUCTS.daily.group, "everyday");
  assert.equal(PRODUCTS.ads.paid, false);
  assert.equal(PRODUCTS.ads.group, "professional");
  assert.equal(PRODUCTS.intelligence.group, "everyday");
  assert.equal(PRODUCTS.commerce.group, "commerce");
  assert.equal(PRODUCTS.writer.paid, false);
  assert.equal(PRODUCTS.translate.paid, false);
  assert.equal(PRODUCTS.documents.paid, false);
  assert.equal(PRODUCTS.coding.paid, true);
  assert.equal(PRODUCTS.shipping.group, "commerce");
  assert.equal(PRODUCTS.health.group, "life");
  assert.equal(productKeyFromMode("writer"), "writer");
  assert.equal(productKeyFromMode("shipping"), "shipping");
});
