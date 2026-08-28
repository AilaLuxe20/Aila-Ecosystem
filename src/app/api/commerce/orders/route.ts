import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  searchParamsObject,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { createCommerceOrderSchema, listCommerceQuerySchema } from "@/core/commerce/schema";
import { createUserCommerceOrder, listUserCommerceOrders } from "@/core/commerce/service";
import { created, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("commerce");

export async function GET(req: Request) {
  try {
    const user = await requireWorkspaceUser("commerce");
    const rateLimit = await limits.enforceRead(user.id);
    const query = parseJsonBody(
      searchParamsObject(new URL(req.url).searchParams),
      listCommerceQuerySchema,
    );
    const orders = await listUserCommerceOrders(user.id, query);
    return withRateLimitHeaders(ok({ orders }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireWorkspaceUser("commerce");
    const rateLimit = await limits.enforceWrite(user.id);
    const body = parseJsonBody(await readJsonBody(req), createCommerceOrderSchema);
    const order = await createUserCommerceOrder(user.id, body);
    return withRateLimitHeaders(created({ order }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
