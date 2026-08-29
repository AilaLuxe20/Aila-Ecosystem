import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { requireAdsActor } from "@/core/ads/actor";
import { adsIdSchema, createAdsCreativeSchema } from "@/core/ads/schema";
import { createUserAdsCreative } from "@/core/ads/service";
import { created } from "@/server/http/responses";

const limits = createProductRateLimiters("ads");

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: Request, context: RouteContext) {
  try {
    const actor = await requireAdsActor();
    const rateLimit = await limits.enforceWrite(actor.userId);
    const { id } = await context.params;
    const creative = await createUserAdsCreative(
      actor.userId,
      actor.plan,
      parseJsonBody(id, adsIdSchema),
      parseJsonBody(await readJsonBody(req), createAdsCreativeSchema),
    );
    return withRateLimitHeaders(created({ creative }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
