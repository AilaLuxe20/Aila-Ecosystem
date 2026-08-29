import assert from "node:assert/strict";
import { test } from "node:test";

import { createAdsCampaignSchema } from "./schema";

test("campaign schema accepts a complete draft", () => {
  const parsed = createAdsCampaignSchema.safeParse({
    name: "Spring",
    objective: "traffic",
    budgetCents: 5000,
    headline: "Try Aila",
    body: "Plan campaigns without buying ad inventory.",
    currency: "ngn",
    timezone: "Africa/Lagos",
    intendedPlatform: "meta",
    location: "Lagos, Nigeria",
    landingPageUrl: "https://example.com/offer",
  });
  assert.equal(parsed.success, true);
});

test("campaign schema accepts a plan without copy", () => {
  const parsed = createAdsCampaignSchema.safeParse({
    name: "Spring",
    objective: "leads",
    budgetCents: 5000,
  });
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.headline, "");
    assert.equal(parsed.data.currency, "usd");
  }
});

test("campaign schema rejects a private landing URL scheme", () => {
  const parsed = createAdsCampaignSchema.safeParse({
    name: "Spring",
    objective: "traffic",
    budgetCents: 5000,
    landingPageUrl: "javascript:alert(1)",
  });
  assert.equal(parsed.success, false);
});

test("campaign schema rejects a tiny budget", () => {
  const parsed = createAdsCampaignSchema.safeParse({
    name: "Spring",
    objective: "traffic",
    budgetCents: 1,
    headline: "Try Aila",
    body: "Too small.",
  });
  assert.equal(parsed.success, false);
});
