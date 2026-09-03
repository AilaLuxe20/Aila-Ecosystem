import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { createWriterCharacterSchema, writerIdSchema } from "@/core/writer/schema";
import { createWriterCharacter } from "@/core/writer/books";
import { created } from "@/server/http/responses";

const limits = createProductRateLimiters("writer-books");

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("writer");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    const character = await createWriterCharacter(
      user.id,
      parseJsonBody(id, writerIdSchema),
      parseJsonBody(await readJsonBody(req), createWriterCharacterSchema),
    );
    return withRateLimitHeaders(created({ character }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
