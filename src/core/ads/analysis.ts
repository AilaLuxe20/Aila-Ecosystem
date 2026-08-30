export type StoredCampaignSnapshot = {
  name: string;
  objective: string;
  status: string;
  budgetCents: number;
  plannedSpendCents: number | null;
  currency: string;
  headline: string;
  body: string;
  audience: string | null;
  location: string | null;
  landingPageUrl: string | null;
  conversionGoal: string | null;
  callToAction: string | null;
  intendedPlatform: string | null;
  targetingNotes: string | null;
  startsAt: string | null;
  endsAt: string | null;
  creativeCount: number;
  landingFetchStatus: string | null;
  platformConnected: boolean;
};

export type StoredCampaignAnalysis = {
  source: "stored_campaign";
  metricsAvailable: false;
  plannedBudgetCents: number;
  plannedSpendCents: number;
  actualSpendCents: null;
  notes: string[];
};

export function analyzeStoredCampaign(snapshot: StoredCampaignSnapshot): StoredCampaignAnalysis {
  const notes: string[] = [];
  const plannedSpendCents = snapshot.plannedSpendCents ?? snapshot.budgetCents;

  if (!snapshot.headline.trim()) {
    notes.push("No headline is saved on this campaign yet.");
  }
  if (!snapshot.body.trim()) {
    notes.push("No body copy is saved on this campaign yet.");
  }
  if (!snapshot.audience?.trim()) {
    notes.push("No audience description is saved. Use the AI audience assistant for a labelled suggestion.");
  }
  if (!snapshot.landingPageUrl) {
    notes.push("No landing page URL is saved.");
  } else if (snapshot.landingFetchStatus && snapshot.landingFetchStatus !== "success") {
    notes.push("The last landing-page fetch did not succeed, so Aila has no page content to analyse.");
  }
  if (!snapshot.conversionGoal?.trim()) {
    notes.push("No conversion goal is saved.");
  }
  if (!snapshot.intendedPlatform) {
    notes.push("No intended platform is selected. This is a plan only until a network is connected.");
  }
  if (snapshot.creativeCount === 0) {
    notes.push("No creatives are stored yet. Generate or write at least one variation.");
  }
  if (!snapshot.platformConnected) {
    notes.push(
      "No ad platform is connected. Live impressions, clicks, spend, CTR, and ROAS are unavailable and will not be invented.",
    );
  }
  notes.push(
    `Planned budget is ${(snapshot.budgetCents / 100).toFixed(2)} ${snapshot.currency.toUpperCase()}. Actual spend from an ad network is unavailable until a platform is connected.`,
  );

  return {
    source: "stored_campaign",
    metricsAvailable: false,
    plannedBudgetCents: snapshot.budgetCents,
    plannedSpendCents,
    actualSpendCents: null,
    notes,
  };
}
