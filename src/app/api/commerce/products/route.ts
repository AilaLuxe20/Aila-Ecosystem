import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  searchParamsObject,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { createCommerceProductSchema, listCommerceQuerySchema } from "@/core/commerce/schema";
import {
  createUserCommerceProduct,
  listUserCommerceProducts,
} from "@/core/commerce/service";
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
    const products = await listUserCommerceProducts(user.id, query);
    return withRateLimitHeaders(ok({ products }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireWorkspaceUser("commerce");
    const rateLimit = await limits.enforceWrite(user.id);
    const body = parseJsonBody(await readJsonBody(req), createCommerceProductSchema);
    const product = await createUserCommerceProduct(user.id, body);
    return withRateLimitHeaders(created({ product }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
