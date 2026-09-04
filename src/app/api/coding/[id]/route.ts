import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { codingIdSchema, updateCodingProjectSchema } from "@/core/coding/schema";
import { deleteCodingProject, getCodingProject, updateCodingProject } from "@/core/coding/service";
import { noContent, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("coding");

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("coding");
    const rateLimit = await limits.enforceRead(user.id);
    const { id } = await context.params;
    const project = await getCodingProject(user.id, parseJsonBody(id, codingIdSchema));
    return withRateLimitHeaders(ok({ project }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("coding");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    const project = await updateCodingProject(
      user.id,
      parseJsonBody(id, codingIdSchema),
      parseJsonBody(await readJsonBody(req), updateCodingProjectSchema),
    );
    return withRateLimitHeaders(ok({ project }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("coding");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    await deleteCodingProject(user.id, parseJsonBody(id, codingIdSchema));
    return withRateLimitHeaders(noContent(), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
