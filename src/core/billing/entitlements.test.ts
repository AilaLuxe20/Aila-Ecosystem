import assert from "node:assert/strict";
import { test } from "node:test";

import {
  evaluateEntitlement,
  isActiveSubscriptionStatus,
  isLocalProductUnlockEnabled,
} from "./entitlements";

test("intelligence is available to signed-in users without a subscription", () => {
  const decision = evaluateEntitlement("user", "intelligence", false);
  assert.equal(decision.allowed, true);
  assert.equal(decision.reason, "free_product");
});

test("daily is available to signed-in users without a subscription", () => {
  const decision = evaluateEntitlement("user", "daily", false);
  assert.equal(decision.allowed, true);
  assert.equal(decision.reason, "free_product");
});

test("ads is available to signed-in users without a subscription", () => {
  const decision = evaluateEntitlement("user", "ads", false);
  assert.equal(decision.allowed, true);
  assert.equal(decision.reason, "free_product");
});

test("writer, translate, and documents are free everyday products", () => {
  assert.equal(evaluateEntitlement("user", "writer", false).allowed, true);
  assert.equal(evaluateEntitlement("user", "translate", false).allowed, true);
  assert.equal(evaluateEntitlement("user", "documents", false).allowed, true);
});

test("new life and professional products stay paid", () => {
  assert.equal(evaluateEntitlement("user", "coding", false).allowed, false);
  assert.equal(evaluateEntitlement("user", "health", false).allowed, false);
  assert.equal(evaluateEntitlement("user", "shipping", false).allowed, false);
});

test("paid products require a subscription for the default user role", () => {
  const decision = evaluateEntitlement("user", "business", false);
  assert.equal(decision.allowed, false);
  assert.equal(decision.reason, "subscription_required");
});

test("an active Stripe subscription unlocks paid products", () => {
  const decision = evaluateEntitlement("user", "ailalegal", true);
  assert.equal(decision.allowed, true);
  assert.equal(decision.reason, "active_subscription");
});

test("staff roles can access paid products without Stripe", () => {
  assert.equal(evaluateEntitlement("admin", "commerce", false).allowed, true);
  assert.equal(evaluateEntitlement("enterprise", "flow", false).allowed, true);
  assert.equal(evaluateEntitlement("business", "ads", false).allowed, true);
});

test("Clerk pro role unlocks paid products", () => {
  const decision = evaluateEntitlement("pro", "sites", false);
  assert.equal(decision.allowed, true);
  assert.equal(decision.reason, "clerk_pro");
});

test("guests cannot use any product", () => {
  assert.equal(evaluateEntitlement("guest", "intelligence", true).allowed, false);
  assert.equal(evaluateEntitlement(null, "intelligence", true).allowed, false);
});

test("local product unlock is off under the test runner", () => {
  assert.equal(isLocalProductUnlockEnabled(), false);
});

test("active subscription statuses include Paystack non-renewing and exclude cancelled", () => {
  assert.equal(isActiveSubscriptionStatus("active"), true);
  assert.equal(isActiveSubscriptionStatus("non-renewing"), true);
  assert.equal(isActiveSubscriptionStatus("attention"), true);
  assert.equal(isActiveSubscriptionStatus("trialing"), true);
  assert.equal(isActiveSubscriptionStatus("past_due"), true);
  assert.equal(isActiveSubscriptionStatus("canceled"), false);
  assert.equal(isActiveSubscriptionStatus("cancelled"), false);
  assert.equal(isActiveSubscriptionStatus("unpaid"), false);
});
