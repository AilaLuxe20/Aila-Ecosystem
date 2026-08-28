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
  });
  assert.equal(parsed.success, true);
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
