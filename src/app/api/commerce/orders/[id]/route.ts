import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { commerceIdSchema, updateCommerceOrderSchema } from "@/core/commerce/schema";
import { updateUserCommerceOrder } from "@/core/commerce/service";
import { ok } from "@/server/http/responses";

const limits = createProductRateLimiters("commerce");

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser();
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    const order = await updateUserCommerceOrder(
      user.id,
      parseJsonBody(id, commerceIdSchema),
      parseJsonBody(await readJsonBody(req), updateCommerceOrderSchema),
    );
    return withRateLimitHeaders(ok({ order }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
