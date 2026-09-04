import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { requireAdsActor } from "@/core/ads/actor";
import { generateAdsSchema } from "@/core/ads/schema";
import { generateUserAdsCreatives } from "@/core/ads/service";
import { created } from "@/server/http/responses";

const limits = createProductRateLimiters("ads");

export async function POST(req: Request) {
  try {
    const actor = await requireAdsActor();
    const rateLimit = await limits.enforceWrite(actor.userId);
    const body = parseJsonBody(await readJsonBody(req), generateAdsSchema);
    const creatives = await generateUserAdsCreatives(
      actor.userId,
      actor.plan,
      body.campaignId,
      body.count,
    );
    return withRateLimitHeaders(created({ creatives }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
