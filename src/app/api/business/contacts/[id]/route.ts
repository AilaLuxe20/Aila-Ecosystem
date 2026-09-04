import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { businessIdSchema, updateBusinessContactSchema } from "@/core/business/schema";
import {
  deleteUserBusinessContact,
  updateUserBusinessContact,
} from "@/core/business/service";
import { noContent, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("business");

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("business");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    const contact = await updateUserBusinessContact(
      user.id,
      parseJsonBody(id, businessIdSchema),
      parseJsonBody(await readJsonBody(req), updateBusinessContactSchema),
    );
    return withRateLimitHeaders(ok({ contact }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("business");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    await deleteUserBusinessContact(user.id, parseJsonBody(id, businessIdSchema));
    return withRateLimitHeaders(noContent(), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
