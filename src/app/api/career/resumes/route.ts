import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  searchParamsObject,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { createCareerResumeSchema, listCareerQuerySchema } from "@/core/career/schema";
import { createCareerResume, listCareerResumes } from "@/core/career/service";
import { created, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("career");

export async function GET(req: Request) {
  try {
    const user = await requireWorkspaceUser("career");
    const rateLimit = await limits.enforceRead(user.id);
    const query = parseJsonBody(searchParamsObject(new URL(req.url).searchParams), listCareerQuerySchema);
    const resumes = await listCareerResumes(user.id, query);
    return withRateLimitHeaders(ok({ resumes }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireWorkspaceUser("career");
    const rateLimit = await limits.enforceWrite(user.id);
    const body = parseJsonBody(await readJsonBody(req), createCareerResumeSchema);
    const resume = await createCareerResume(user.id, body);
    return withRateLimitHeaders(created({ resume }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
