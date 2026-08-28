import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  searchParamsObject,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { createSiteSchema, listSitesQuerySchema } from "@/core/sites/schema";
import { createUserSite, listUserSites } from "@/core/sites/service";
import { created, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("sites");

export async function GET(req: Request) {
  try {
    const user = await requireWorkspaceUser();
    const rateLimit = await limits.enforceRead(user.id);
    const query = parseJsonBody(
      searchParamsObject(new URL(req.url).searchParams),
      listSitesQuerySchema,
    );
    const sites = await listUserSites(user.id, query);
    return withRateLimitHeaders(ok({ sites }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireWorkspaceUser();
    const rateLimit = await limits.enforceWrite(user.id);
    const body = parseJsonBody(await readJsonBody(req), createSiteSchema);
    const site = await createUserSite(user.id, body);
    return withRateLimitHeaders(created({ site }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
