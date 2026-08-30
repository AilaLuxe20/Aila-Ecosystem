import assert from "node:assert/strict";
import { test } from "node:test";

import { BILLING_PLANS, resolveBillingPlanId, STRIPE_TRIAL_DAYS } from "./plans";

test("only Pro is a self-serve Stripe plan", () => {
  const purchasable = BILLING_PLANS.filter((plan) => plan.purchasable);
  assert.deepEqual(
    purchasable.map((plan) => plan.id),
    ["pro"],
  );
  assert.equal(purchasable[0]?.trialDays, STRIPE_TRIAL_DAYS);
  assert.equal(purchasable[0]?.stripePriceEnv, "STRIPE_PRICE_PRO");
});

test("staff roles resolve without inventing a Stripe Business price", () => {
  assert.equal(resolveBillingPlanId("business", false), "business");
  assert.equal(resolveBillingPlanId("enterprise", false), "enterprise");
  assert.equal(resolveBillingPlanId("admin", false), "enterprise");
  assert.equal(resolveBillingPlanId("user", false), "free");
  assert.equal(resolveBillingPlanId("user", true), "pro");
});
