import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  searchParamsObject,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { createCareerApplicationSchema, listCareerQuerySchema } from "@/core/career/schema";
import { createCareerApplication, listCareerApplications } from "@/core/career/service";
import { created, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("career");

export async function GET(req: Request) {
  try {
    const user = await requireWorkspaceUser("career");
    const rateLimit = await limits.enforceRead(user.id);
    const query = parseJsonBody(searchParamsObject(new URL(req.url).searchParams), listCareerQuerySchema);
    const applications = await listCareerApplications(user.id, query);
    return withRateLimitHeaders(ok({ applications }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireWorkspaceUser("career");
    const rateLimit = await limits.enforceWrite(user.id);
    const body = parseJsonBody(await readJsonBody(req), createCareerApplicationSchema);
    const application = await createCareerApplication(user.id, body);
    return withRateLimitHeaders(created({ application }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
