import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { businessIdSchema, updateBusinessTaskSchema } from "@/core/business/schema";
import { deleteUserBusinessTask, updateUserBusinessTask } from "@/core/business/service";
import { noContent, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("business");

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser();
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    const task = await updateUserBusinessTask(
      user.id,
      parseJsonBody(id, businessIdSchema),
      parseJsonBody(await readJsonBody(req), updateBusinessTaskSchema),
    );
    return withRateLimitHeaders(ok({ task }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser();
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    await deleteUserBusinessTask(user.id, parseJsonBody(id, businessIdSchema));
    return withRateLimitHeaders(noContent(), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
