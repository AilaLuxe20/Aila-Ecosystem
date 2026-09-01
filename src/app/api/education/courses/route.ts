import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  searchParamsObject,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { createEducationCourseSchema, listEducationQuerySchema } from "@/core/education/schema";
import { createEducationCourse, listEducationCourses } from "@/core/education/service";
import { created, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("education");

export async function GET(req: Request) {
  try {
    const user = await requireWorkspaceUser("education");
    const rateLimit = await limits.enforceRead(user.id);
    const query = parseJsonBody(
      searchParamsObject(new URL(req.url).searchParams),
      listEducationQuerySchema,
    );
    const courses = await listEducationCourses(user.id, query);
    return withRateLimitHeaders(ok({ courses }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireWorkspaceUser("education");
    const rateLimit = await limits.enforceWrite(user.id);
    const body = parseJsonBody(await readJsonBody(req), createEducationCourseSchema);
    const course = await createEducationCourse(user.id, body);
    return withRateLimitHeaders(created({ course }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
