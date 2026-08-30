import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { healthIdSchema, updateHealthLogSchema } from "@/core/health/schema";
import { deleteHealthLog, updateHealthLog } from "@/core/health/service";
import { noContent, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("health");

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("health");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    const log = await updateHealthLog(
      user.id,
      parseJsonBody(id, healthIdSchema),
      parseJsonBody(await readJsonBody(req), updateHealthLogSchema),
    );
    return withRateLimitHeaders(ok({ log }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("health");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    await deleteHealthLog(user.id, parseJsonBody(id, healthIdSchema));
    return withRateLimitHeaders(noContent(), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
