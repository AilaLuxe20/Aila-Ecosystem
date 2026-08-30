import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  searchParamsObject,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { createCodingProjectSchema, listCodingQuerySchema } from "@/core/coding/schema";
import { createCodingProject, listCodingProjects } from "@/core/coding/service";
import { created, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("coding");

export async function GET(req: Request) {
  try {
    const user = await requireWorkspaceUser("coding");
    const rateLimit = await limits.enforceRead(user.id);
    const query = parseJsonBody(searchParamsObject(new URL(req.url).searchParams), listCodingQuerySchema);
    const projects = await listCodingProjects(user.id, query);
    return withRateLimitHeaders(ok({ projects }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireWorkspaceUser("coding");
    const rateLimit = await limits.enforceWrite(user.id);
    const body = parseJsonBody(await readJsonBody(req), createCodingProjectSchema);
    const project = await createCodingProject(user.id, body);
    return withRateLimitHeaders(created({ project }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
