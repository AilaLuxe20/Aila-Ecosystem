import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  searchParamsObject,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { createTravelTripSchema, listTravelQuerySchema } from "@/core/travel/schema";
import { createTravelTrip, listTravelTrips } from "@/core/travel/service";
import { created, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("travel");

export async function GET(req: Request) {
  try {
    const user = await requireWorkspaceUser("travel");
    const rateLimit = await limits.enforceRead(user.id);
    const query = parseJsonBody(searchParamsObject(new URL(req.url).searchParams), listTravelQuerySchema);
    const trips = await listTravelTrips(user.id, query);
    return withRateLimitHeaders(ok({ trips }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireWorkspaceUser("travel");
    const rateLimit = await limits.enforceWrite(user.id);
    const body = parseJsonBody(await readJsonBody(req), createTravelTripSchema);
    const trip = await createTravelTrip(user.id, body);
    return withRateLimitHeaders(created({ trip }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
