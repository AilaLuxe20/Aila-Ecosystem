import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { adsIdSchema, updateAdsCampaignSchema } from "@/core/ads/schema";
import { deleteUserAdsCampaign, updateUserAdsCampaign } from "@/core/ads/service";
import { noContent, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("ads");

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser();
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    const campaign = await updateUserAdsCampaign(
      user.id,
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
    const user = await requireWorkspaceUser();
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    await deleteUserAdsCampaign(user.id, parseJsonBody(id, adsIdSchema));
    return withRateLimitHeaders(noContent(), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
