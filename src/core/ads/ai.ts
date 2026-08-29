import { chat } from "@/core/ai/engine";
import { ConfigurationError, ExternalServiceError } from "@/lib/errors/app-error";

import { parseJsonObject, readString } from "./json";

async function adsJsonChat(prompt: string): Promise<Record<string, unknown>> {
  const result = await chat({
    mode: "ads",
    messages: [{ role: "user", content: prompt }],
  });

  if (!result.success) {
    if (result.error?.includes("not configured")) {
      throw new ConfigurationError({
        message: "OPENROUTER_API_KEY is not configured, so Aila Ads cannot generate copy.",
      });
    }
    throw new ExternalServiceError("OpenRouter", {
      message: result.error ?? "Aila Ads could not complete that request.",
    });
  }

  return parseJsonObject(result.reply);
}

export type GeneratedCreative = {
  headline: string;
  body: string;
  callToAction: string | null;
  variantLabel: string | null;
};

export async function generateAdCopy(input: {
  count: number;
  name: string;
  objective: string;
  audience: string | null;
  location: string | null;
  landingPageUrl: string | null;
  conversionGoal: string | null;
  intendedPlatform: string | null;
  headline: string;
  body: string;
}): Promise<GeneratedCreative[]> {
  const parsed = await adsJsonChat(`Create ${input.count} advertising copy variations for a campaign plan stored in Aila Ads.

Return JSON only in this shape:
{"variations":[{"variantLabel":"string","headline":"string","body":"string","callToAction":"string"}]}

Rules:
- Never invent impressions, spend, CTR, ROAS, or other performance numbers.
- Never claim an ad network is connected or that ads were purchased.
- Headlines max 90 characters. Body max 2000 characters.
- Write for ${input.intendedPlatform ?? "a general paid channel"}.
- Campaign name: ${input.name}
- Objective: ${input.objective}
- Audience: ${input.audience ?? "not specified"}
- Location: ${input.location ?? "not specified"}
- Landing page: ${input.landingPageUrl ?? "not specified"}
- Conversion goal: ${input.conversionGoal ?? "not specified"}
- Existing headline: ${input.headline || "none"}
- Existing body: ${input.body || "none"}
`);

  const variations = Array.isArray(parsed.variations) ? parsed.variations : [];
  const creatives: GeneratedCreative[] = [];

  for (const item of variations) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const headline = readString(row.headline).slice(0, 90);
    const body = readString(row.body).slice(0, 2000);
    if (!headline || !body) continue;
    creatives.push({
      headline,
      body,
      callToAction: readString(row.callToAction).slice(0, 80) || null,
      variantLabel: readString(row.variantLabel).slice(0, 80) || null,
    });
    if (creatives.length >= input.count) break;
  }

  if (creatives.length === 0) {
    throw new ExternalServiceError("OpenRouter", {
      message: "Aila Ads did not return usable ad copy.",
    });
  }

  return creatives;
}

export async function generateAudienceSuggestion(input: {
  name: string;
  objective: string;
  location: string | null;
  targetingNotes: string | null;
  brief?: string;
}): Promise<{ audience: string; location: string | null; rationale: string }> {
  const parsed = await adsJsonChat(`Suggest an advertising audience for a campaign plan stored in Aila Ads.

Return JSON only:
{"audience":"string","location":"string","rationale":"string"}

Rules:
- This is an AI suggestion from the campaign brief, not from Meta, Google, TikTok, or LinkedIn audience data.
- Never invent platform audience sizes, CPM, CTR, or reach numbers.
- Campaign name: ${input.name}
- Objective: ${input.objective}
- Location already saved: ${input.location ?? "not specified"}
- Targeting notes: ${input.targetingNotes ?? "none"}
- Extra brief: ${input.brief ?? "none"}
`);

  const audience = readString(parsed.audience);
  if (!audience) {
    throw new ExternalServiceError("OpenRouter", {
      message: "Aila Ads did not return an audience suggestion.",
    });
  }

  return {
    audience: audience.slice(0, 5000),
    location: readString(parsed.location).slice(0, 500) || input.location,
    rationale: readString(parsed.rationale).slice(0, 2000) || "AI suggestion based on the saved campaign brief.",
  };
}

export async function analyseFetchedLandingPage(input: {
  url: string;
  title: string | null;
  excerpt: string;
  objective: string;
  headline: string;
}): Promise<string> {
  const parsed = await adsJsonChat(`Analyse this landing page using only the fetched text below. If something is missing from the fetch, say so.

Return JSON only:
{"analysis":"string"}

Rules:
- Never invent traffic, conversion rate, or ad performance.
- Never claim you crawled more than the excerpt provided.
- URL: ${input.url}
- Fetched title: ${input.title ?? "none"}
- Campaign objective: ${input.objective}
- Current headline: ${input.headline || "none"}
- Fetched excerpt:
${input.excerpt}
`);

  const analysis = readString(parsed.analysis);
  if (!analysis) {
    throw new ExternalServiceError("OpenRouter", {
      message: "Aila Ads did not return a landing-page analysis.",
    });
  }
  return analysis.slice(0, 8000);
}

export async function summariseStoredCampaign(notes: string[], campaignJson: string): Promise<string> {
  const parsed = await adsJsonChat(`Summarise this Aila Ads campaign using only the stored JSON and notes. Do not invent metrics.

Return JSON only:
{"summary":"string"}

Stored notes:
${notes.join("\n")}

Stored campaign JSON:
${campaignJson}
`);

  return readString(parsed.summary).slice(0, 8000);
}
