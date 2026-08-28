import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  searchParamsObject,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { createAppListingSchema, listAppsQuerySchema } from "@/core/apps/schema";
import { createUserAppListing, listUserAppListings } from "@/core/apps/service";
import { created, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("apps");

export async function GET(req: Request) {
  try {
    const user = await requireWorkspaceUser();
    const rateLimit = await limits.enforceRead(user.id);
    const query = parseJsonBody(searchParamsObject(new URL(req.url).searchParams), listAppsQuerySchema);
    const apps = await listUserAppListings(user.id, query);
    return withRateLimitHeaders(ok({ apps }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireWorkspaceUser();
    const rateLimit = await limits.enforceWrite(user.id);
    const body = parseJsonBody(await readJsonBody(req), createAppListingSchema);
    const app = await createUserAppListing(user.id, body);
    return withRateLimitHeaders(created({ app }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
