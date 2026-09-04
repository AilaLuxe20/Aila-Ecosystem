import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { educationIdSchema, updateEducationNoteSchema } from "@/core/education/schema";
import { deleteEducationNote, updateEducationNote } from "@/core/education/service";
import { noContent, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("education");

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("education");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    const note = await updateEducationNote(
      user.id,
      parseJsonBody(id, educationIdSchema),
      parseJsonBody(await readJsonBody(req), updateEducationNoteSchema),
    );
    return withRateLimitHeaders(ok({ note }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("education");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    await deleteEducationNote(user.id, parseJsonBody(id, educationIdSchema));
    return withRateLimitHeaders(noContent(), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
