import assert from "node:assert/strict";
import { test } from "node:test";

import { analyzeStoredCampaign } from "./analysis";

test("stored analysis never claims live metrics", () => {
  const result = analyzeStoredCampaign({
    name: "Spring",
    objective: "sales",
    status: "draft",
    budgetCents: 5000,
    plannedSpendCents: 5000,
    currency: "usd",
    headline: "",
    body: "",
    audience: null,
    location: null,
    landingPageUrl: null,
    conversionGoal: null,
    callToAction: null,
    intendedPlatform: null,
    targetingNotes: null,
    startsAt: null,
    endsAt: null,
    creativeCount: 0,
    landingFetchStatus: null,
    platformConnected: false,
  });

  assert.equal(result.metricsAvailable, false);
  assert.equal(result.actualSpendCents, null);
  assert.equal(result.source, "stored_campaign");
  assert.ok(result.notes.some((note) => note.includes("No ad platform is connected")));
  assert.ok(!result.notes.some((note) => /CTR|ROAS|impressions/i.test(note) && /[0-9]{2,}/.test(note)));
});
