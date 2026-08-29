import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { requireAdsActor } from "@/core/ads/actor";
import { audienceAssistSchema } from "@/core/ads/schema";
import { assistCampaignAudience } from "@/core/ads/service";
import { ok } from "@/server/http/responses";

const limits = createProductRateLimiters("ads");

export async function POST(req: Request) {
  try {
    const actor = await requireAdsActor();
    const rateLimit = await limits.enforceWrite(actor.userId);
    const body = parseJsonBody(await readJsonBody(req), audienceAssistSchema);
    const result = await assistCampaignAudience(actor.userId, actor.plan, body);
    return withRateLimitHeaders(ok(result), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
