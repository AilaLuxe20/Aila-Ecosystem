import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { updateWriterChapterSchema, writerIdSchema } from "@/core/writer/schema";
import { deleteWriterChapter, updateWriterChapter } from "@/core/writer/books";
import { noContent, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("writer-books");

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("writer");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    const chapter = await updateWriterChapter(
      user.id,
      parseJsonBody(id, writerIdSchema),
      parseJsonBody(await readJsonBody(req), updateWriterChapterSchema),
    );
    return withRateLimitHeaders(ok({ chapter }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("writer");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    await deleteWriterChapter(user.id, parseJsonBody(id, writerIdSchema));
    return withRateLimitHeaders(noContent(), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
