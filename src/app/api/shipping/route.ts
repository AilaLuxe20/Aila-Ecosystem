import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  searchParamsObject,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { createShippingShipmentSchema, listShippingQuerySchema } from "@/core/shipping/schema";
import { createShippingShipment, listShippingShipments } from "@/core/shipping/service";
import { created, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("shipping");

export async function GET(req: Request) {
  try {
    const user = await requireWorkspaceUser("shipping");
    const rateLimit = await limits.enforceRead(user.id);
    const query = parseJsonBody(
      searchParamsObject(new URL(req.url).searchParams),
      listShippingQuerySchema,
    );
    const shipments = await listShippingShipments(user.id, query);
    return withRateLimitHeaders(ok({ shipments }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireWorkspaceUser("shipping");
    const rateLimit = await limits.enforceWrite(user.id);
    const body = parseJsonBody(await readJsonBody(req), createShippingShipmentSchema);
    const shipment = await createShippingShipment(user.id, body);
    return withRateLimitHeaders(created({ shipment }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
