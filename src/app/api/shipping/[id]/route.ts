import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { shippingIdSchema, updateShippingShipmentSchema } from "@/core/shipping/schema";
import { deleteShippingShipment, updateShippingShipment } from "@/core/shipping/service";
import { noContent, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("shipping");

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("shipping");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    const shipment = await updateShippingShipment(
      user.id,
      parseJsonBody(id, shippingIdSchema),
      parseJsonBody(await readJsonBody(req), updateShippingShipmentSchema),
    );
    return withRateLimitHeaders(ok({ shipment }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("shipping");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    await deleteShippingShipment(user.id, parseJsonBody(id, shippingIdSchema));
    return withRateLimitHeaders(noContent(), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
