import {
  createProductRateLimiters,
  parseJsonBody,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { translateIdSchema } from "@/core/translate/schema";
import { deleteTranslateEntry } from "@/core/translate/service";
import { noContent } from "@/server/http/responses";

const limits = createProductRateLimiters("translate");

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("translate");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    await deleteTranslateEntry(user.id, parseJsonBody(id, translateIdSchema));
    return withRateLimitHeaders(noContent(), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
