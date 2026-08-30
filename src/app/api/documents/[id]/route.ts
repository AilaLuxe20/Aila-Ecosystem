import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { documentIdSchema, updateDocumentNotesSchema } from "@/core/documents/schema";
import { deleteLibraryDocument, updateLibraryDocumentNotes } from "@/core/documents/service";
import { noContent, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("documents");

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("documents");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    const document = await updateLibraryDocumentNotes(
      user.id,
      parseJsonBody(id, documentIdSchema),
      parseJsonBody(await readJsonBody(req), updateDocumentNotesSchema),
    );
    return withRateLimitHeaders(ok({ document }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("documents");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    await deleteLibraryDocument(user.id, parseJsonBody(id, documentIdSchema));
    return withRateLimitHeaders(noContent(), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
