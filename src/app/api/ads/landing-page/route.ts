import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { requireAdsActor } from "@/core/ads/actor";
import { analyzeLandingPageSchema } from "@/core/ads/schema";
import { analyzeUserLandingPage } from "@/core/ads/service";
import { created } from "@/server/http/responses";

const limits = createProductRateLimiters("ads");

export async function POST(req: Request) {
  try {
    const actor = await requireAdsActor();
    const rateLimit = await limits.enforceWrite(actor.userId);
    const body = parseJsonBody(await readJsonBody(req), analyzeLandingPageSchema);
    const landing = await analyzeUserLandingPage(actor.userId, actor.plan, body);
    return withRateLimitHeaders(created({ landing }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
