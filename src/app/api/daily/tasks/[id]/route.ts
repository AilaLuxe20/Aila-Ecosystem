import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { dailyIdSchema, updateDailyTaskSchema } from "@/core/daily/schema";
import { deleteUserDailyTask, updateUserDailyTask } from "@/core/daily/service";
import { noContent, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("daily");

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("daily");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    const task = await updateUserDailyTask(
      user.id,
      parseJsonBody(id, dailyIdSchema),
      parseJsonBody(await readJsonBody(req), updateDailyTaskSchema),
    );
    return withRateLimitHeaders(ok({ task }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("daily");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    await deleteUserDailyTask(user.id, parseJsonBody(id, dailyIdSchema));
    return withRateLimitHeaders(noContent(), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
