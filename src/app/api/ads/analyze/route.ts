import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { requireAdsActor } from "@/core/ads/actor";
import { analyzeCampaignSchema } from "@/core/ads/schema";
import { analyzeUserAdsCampaign } from "@/core/ads/service";
import { ok } from "@/server/http/responses";

const limits = createProductRateLimiters("ads");

export async function POST(req: Request) {
  try {
    const actor = await requireAdsActor();
    const rateLimit = await limits.enforceWrite(actor.userId);
    const body = parseJsonBody(await readJsonBody(req), analyzeCampaignSchema);
    const result = await analyzeUserAdsCampaign(actor.userId, actor.plan, body.campaignId);
    return withRateLimitHeaders(ok(result), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
