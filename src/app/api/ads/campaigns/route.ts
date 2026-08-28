import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  searchParamsObject,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { createAdsCampaignSchema, listAdsQuerySchema } from "@/core/ads/schema";
import { createUserAdsCampaign, listUserAdsCampaigns } from "@/core/ads/service";
import { created, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("ads");

export async function GET(req: Request) {
  try {
    const user = await requireWorkspaceUser("ads");
    const rateLimit = await limits.enforceRead(user.id);
    const query = parseJsonBody(searchParamsObject(new URL(req.url).searchParams), listAdsQuerySchema);
    const campaigns = await listUserAdsCampaigns(user.id, query);
    return withRateLimitHeaders(ok({ campaigns }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireWorkspaceUser("ads");
    const rateLimit = await limits.enforceWrite(user.id);
    const body = parseJsonBody(await readJsonBody(req), createAdsCampaignSchema);
    const campaign = await createUserAdsCampaign(user.id, body);
    return withRateLimitHeaders(created({ campaign }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
