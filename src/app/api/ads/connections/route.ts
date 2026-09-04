import {
  createProductRateLimiters,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { requireAdsActor } from "@/core/ads/actor";
import { listAdsConnections } from "@/core/ads/connections";
import { ok } from "@/server/http/responses";

const limits = createProductRateLimiters("ads");

export async function GET() {
  try {
    const actor = await requireAdsActor();
    const rateLimit = await limits.enforceRead(actor.userId);
    const connections = await listAdsConnections(actor.userId);
    return withRateLimitHeaders(ok({ connections }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
