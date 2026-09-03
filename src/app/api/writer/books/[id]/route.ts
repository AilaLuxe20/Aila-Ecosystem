import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { updateWriterBookSchema, writerIdSchema } from "@/core/writer/schema";
import { deleteWriterBook, getWriterBook, updateWriterBook } from "@/core/writer/books";
import { noContent, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("writer-books");

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("writer");
    const rateLimit = await limits.enforceRead(user.id);
    const { id } = await context.params;
    const book = await getWriterBook(user.id, parseJsonBody(id, writerIdSchema));
    return withRateLimitHeaders(ok({ book }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("writer");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    const book = await updateWriterBook(
      user.id,
      parseJsonBody(id, writerIdSchema),
      parseJsonBody(await readJsonBody(req), updateWriterBookSchema),
    );
    return withRateLimitHeaders(ok({ book }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("writer");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    await deleteWriterBook(user.id, parseJsonBody(id, writerIdSchema));
    return withRateLimitHeaders(noContent(), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
