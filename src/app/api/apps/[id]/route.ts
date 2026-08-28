import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { appIdSchema, updateAppListingSchema } from "@/core/apps/schema";
import { deleteUserAppListing, updateUserAppListing } from "@/core/apps/service";
import { noContent, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("apps");

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("apps");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    const app = await updateUserAppListing(
      user.id,
      parseJsonBody(id, appIdSchema),
      parseJsonBody(await readJsonBody(req), updateAppListingSchema),
    );
    return withRateLimitHeaders(ok({ app }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("apps");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    await deleteUserAppListing(user.id, parseJsonBody(id, appIdSchema));
    return withRateLimitHeaders(noContent(), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
