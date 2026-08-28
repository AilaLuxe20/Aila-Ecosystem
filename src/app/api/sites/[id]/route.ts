import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { siteIdSchema, updateSiteSchema } from "@/core/sites/schema";
import { deleteUserSite, updateUserSite } from "@/core/sites/service";
import { noContent, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("sites");

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("sites");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    const site = await updateUserSite(
      user.id,
      parseJsonBody(id, siteIdSchema),
      parseJsonBody(await readJsonBody(req), updateSiteSchema),
    );
    return withRateLimitHeaders(ok({ site }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("sites");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    await deleteUserSite(user.id, parseJsonBody(id, siteIdSchema));
    return withRateLimitHeaders(noContent(), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
