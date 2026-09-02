import assert from "node:assert/strict";
import { test } from "node:test";

import { BILLING_PLANS, resolveBillingPlanId } from "./plans";

test("only Pro is a self-serve Paystack plan", () => {
  const purchasable = BILLING_PLANS.filter((plan) => plan.purchasable);
  assert.deepEqual(
    purchasable.map((plan) => plan.id),
    ["pro"],
  );
  assert.equal(purchasable[0]?.grant, "paystack");
  assert.equal(purchasable[0]?.trialDays, null);
});

test("staff roles resolve without inventing a Paystack Business price", () => {
  assert.equal(resolveBillingPlanId("business", false), "business");
  assert.equal(resolveBillingPlanId("enterprise", false), "enterprise");
  assert.equal(resolveBillingPlanId("admin", false), "enterprise");
  assert.equal(resolveBillingPlanId("user", false), "free");
  assert.equal(resolveBillingPlanId("user", true), "pro");
});

test("Paystack checkout plans expose live NGN pricing", async () => {
  const { PAYSTACK_CHECKOUT_PLANS } = await import("./plans");
  assert.equal(PAYSTACK_CHECKOUT_PLANS[0]?.amountNgn, 15_000);
  assert.equal(PAYSTACK_CHECKOUT_PLANS[1]?.amountNgn, 150_000);
});
