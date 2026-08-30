import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { dailyIdSchema, updateDailyNoteSchema } from "@/core/daily/schema";
import { deleteUserDailyNote, updateUserDailyNote } from "@/core/daily/service";
import { noContent, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("daily");

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("daily");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    const note = await updateUserDailyNote(
      user.id,
      parseJsonBody(id, dailyIdSchema),
      parseJsonBody(await readJsonBody(req), updateDailyNoteSchema),
    );
    return withRateLimitHeaders(ok({ note }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("daily");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    await deleteUserDailyNote(user.id, parseJsonBody(id, dailyIdSchema));
    return withRateLimitHeaders(noContent(), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
