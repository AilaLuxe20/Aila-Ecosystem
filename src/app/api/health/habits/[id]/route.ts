import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { healthIdSchema, updateHealthHabitSchema } from "@/core/health/schema";
import { deleteHealthHabit, updateHealthHabit } from "@/core/health/service";
import { noContent, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("health");

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("health");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    const habit = await updateHealthHabit(
      user.id,
      parseJsonBody(id, healthIdSchema),
      parseJsonBody(await readJsonBody(req), updateHealthHabitSchema),
    );
    return withRateLimitHeaders(ok({ habit }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("health");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    await deleteHealthHabit(user.id, parseJsonBody(id, healthIdSchema));
    return withRateLimitHeaders(noContent(), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
