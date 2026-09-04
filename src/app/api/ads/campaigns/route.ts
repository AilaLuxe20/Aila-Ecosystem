import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  searchParamsObject,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { requireAdsActor } from "@/core/ads/actor";
import { createAdsCampaignSchema, listAdsQuerySchema } from "@/core/ads/schema";
import { createUserAdsCampaign, listUserAdsCampaigns } from "@/core/ads/service";
import { created, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("ads");

export async function GET(req: Request) {
  try {
    const actor = await requireAdsActor();
    const rateLimit = await limits.enforceRead(actor.userId);
    const query = parseJsonBody(searchParamsObject(new URL(req.url).searchParams), listAdsQuerySchema);
    const campaigns = await listUserAdsCampaigns(actor.userId, query);
    return withRateLimitHeaders(ok({ campaigns }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function POST(req: Request) {
  try {
    const actor = await requireAdsActor();
    const rateLimit = await limits.enforceWrite(actor.userId);
    const body = parseJsonBody(await readJsonBody(req), createAdsCampaignSchema);
    const campaign = await createUserAdsCampaign(actor.userId, actor.plan, body);
    return withRateLimitHeaders(created({ campaign }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
