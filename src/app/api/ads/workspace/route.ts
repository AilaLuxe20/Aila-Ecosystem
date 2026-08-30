import {
  createProductRateLimiters,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { requireAdsActor } from "@/core/ads/actor";
import { getAdsWorkspace } from "@/core/ads/service";
import { ok } from "@/server/http/responses";

const limits = createProductRateLimiters("ads");

export async function GET() {
  try {
    const actor = await requireAdsActor();
    const rateLimit = await limits.enforceRead(actor.userId);
    const workspace = await getAdsWorkspace(actor.userId, actor.plan);
    return withRateLimitHeaders(ok({ workspace }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
