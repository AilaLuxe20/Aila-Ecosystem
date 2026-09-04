import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { requireAdsActor } from "@/core/ads/actor";
import { adsIdSchema, updateAdsCampaignSchema } from "@/core/ads/schema";
import {
  deleteUserAdsCampaign,
  getUserAdsCampaign,
  updateUserAdsCampaign,
} from "@/core/ads/service";
import { noContent, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("ads");

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  try {
    const actor = await requireAdsActor();
    const rateLimit = await limits.enforceRead(actor.userId);
    const { id } = await context.params;
    const detail = await getUserAdsCampaign(actor.userId, parseJsonBody(id, adsIdSchema));
    return withRateLimitHeaders(ok(detail), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const actor = await requireAdsActor();
    const rateLimit = await limits.enforceWrite(actor.userId);
    const { id } = await context.params;
    const campaign = await updateUserAdsCampaign(
      actor.userId,
      parseJsonBody(id, adsIdSchema),
      parseJsonBody(await readJsonBody(req), updateAdsCampaignSchema),
    );
    return withRateLimitHeaders(ok({ campaign }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const actor = await requireAdsActor();
    const rateLimit = await limits.enforceWrite(actor.userId);
    const { id } = await context.params;
    await deleteUserAdsCampaign(actor.userId, parseJsonBody(id, adsIdSchema));
    return withRateLimitHeaders(noContent(), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
