import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { commerceIdSchema, updateCommerceProductSchema } from "@/core/commerce/schema";
import {
  deleteUserCommerceProduct,
  updateUserCommerceProduct,
} from "@/core/commerce/service";
import { noContent, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("commerce");

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser();
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    const product = await updateUserCommerceProduct(
      user.id,
      parseJsonBody(id, commerceIdSchema),
      parseJsonBody(await readJsonBody(req), updateCommerceProductSchema),
    );
    return withRateLimitHeaders(ok({ product }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser();
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    await deleteUserCommerceProduct(user.id, parseJsonBody(id, commerceIdSchema));
    return withRateLimitHeaders(noContent(), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
