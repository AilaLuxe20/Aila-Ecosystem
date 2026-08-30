import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { updateWriterDocumentSchema, writerIdSchema } from "@/core/writer/schema";
import { deleteWriterDocument, updateWriterDocument } from "@/core/writer/service";
import { noContent, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("writer");

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("writer");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    const document = await updateWriterDocument(
      user.id,
      parseJsonBody(id, writerIdSchema),
      parseJsonBody(await readJsonBody(req), updateWriterDocumentSchema),
    );
    return withRateLimitHeaders(ok({ document }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("writer");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    await deleteWriterDocument(user.id, parseJsonBody(id, writerIdSchema));
    return withRateLimitHeaders(noContent(), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
