import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { educationIdSchema, updateEducationCourseSchema } from "@/core/education/schema";
import { deleteEducationCourse, updateEducationCourse } from "@/core/education/service";
import { noContent, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("education");

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("education");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    const course = await updateEducationCourse(
      user.id,
      parseJsonBody(id, educationIdSchema),
      parseJsonBody(await readJsonBody(req), updateEducationCourseSchema),
    );
    return withRateLimitHeaders(ok({ course }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("education");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    await deleteEducationCourse(user.id, parseJsonBody(id, educationIdSchema));
    return withRateLimitHeaders(noContent(), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
