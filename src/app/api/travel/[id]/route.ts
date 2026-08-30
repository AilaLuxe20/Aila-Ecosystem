import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { travelIdSchema, updateTravelTripSchema } from "@/core/travel/schema";
import { deleteTravelTrip, updateTravelTrip } from "@/core/travel/service";
import { noContent, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("travel");

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("travel");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    const trip = await updateTravelTrip(
      user.id,
      parseJsonBody(id, travelIdSchema),
      parseJsonBody(await readJsonBody(req), updateTravelTripSchema),
    );
    return withRateLimitHeaders(ok({ trip }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("travel");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    await deleteTravelTrip(user.id, parseJsonBody(id, travelIdSchema));
    return withRateLimitHeaders(noContent(), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
