import {
  createProductRateLimiters,
  parseJsonBody,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { requireAdsActor } from "@/core/ads/actor";
import { adsIdSchema } from "@/core/ads/schema";
import { applyCreativeToCampaign } from "@/core/ads/service";
import { ok } from "@/server/http/responses";

const limits = createProductRateLimiters("ads");

type RouteContext = { params: Promise<{ id: string; creativeId: string }> };

export async function POST(_req: Request, context: RouteContext) {
  try {
    const actor = await requireAdsActor();
    const rateLimit = await limits.enforceWrite(actor.userId);
    const { id, creativeId } = await context.params;
    const campaign = await applyCreativeToCampaign(
      actor.userId,
      parseJsonBody(id, adsIdSchema),
      parseJsonBody(creativeId, adsIdSchema),
    );
    return withRateLimitHeaders(ok({ campaign }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
