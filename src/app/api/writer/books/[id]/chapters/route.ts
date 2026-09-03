import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { createWriterChapterSchema, writerIdSchema } from "@/core/writer/schema";
import { createWriterChapter } from "@/core/writer/books";
import { created } from "@/server/http/responses";

const limits = createProductRateLimiters("writer-books");

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("writer");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    const chapter = await createWriterChapter(
      user.id,
      parseJsonBody(id, writerIdSchema),
      parseJsonBody(await readJsonBody(req), createWriterChapterSchema),
    );
    return withRateLimitHeaders(created({ chapter }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
