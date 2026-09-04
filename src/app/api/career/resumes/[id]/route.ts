import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { careerIdSchema, updateCareerResumeSchema } from "@/core/career/schema";
import { deleteCareerResume, updateCareerResume } from "@/core/career/service";
import { noContent, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("career");

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("career");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    const resume = await updateCareerResume(
      user.id,
      parseJsonBody(id, careerIdSchema),
      parseJsonBody(await readJsonBody(req), updateCareerResumeSchema),
    );
    return withRateLimitHeaders(ok({ resume }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("career");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    await deleteCareerResume(user.id, parseJsonBody(id, careerIdSchema));
    return withRateLimitHeaders(noContent(), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
