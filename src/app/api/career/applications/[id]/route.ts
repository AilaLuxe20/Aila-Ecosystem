import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { careerIdSchema, updateCareerApplicationSchema } from "@/core/career/schema";
import { deleteCareerApplication, updateCareerApplication } from "@/core/career/service";
import { noContent, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("career");

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("career");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    const application = await updateCareerApplication(
      user.id,
      parseJsonBody(id, careerIdSchema),
      parseJsonBody(await readJsonBody(req), updateCareerApplicationSchema),
    );
    return withRateLimitHeaders(ok({ application }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("career");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    await deleteCareerApplication(user.id, parseJsonBody(id, careerIdSchema));
    return withRateLimitHeaders(noContent(), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
