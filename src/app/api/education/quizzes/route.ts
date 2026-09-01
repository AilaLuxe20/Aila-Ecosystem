import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  searchParamsObject,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { createEducationQuizSchema, listEducationQuerySchema } from "@/core/education/schema";
import { createEducationQuiz, listEducationQuizzes } from "@/core/education/service";
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
    const quizzes = await listEducationQuizzes(user.id, query);
    return withRateLimitHeaders(ok({ quizzes }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireWorkspaceUser("education");
    const rateLimit = await limits.enforceWrite(user.id);
    const body = parseJsonBody(await readJsonBody(req), createEducationQuizSchema);
    const quiz = await createEducationQuiz(user.id, body);
    return withRateLimitHeaders(created({ quiz }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
