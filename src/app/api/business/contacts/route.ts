import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  searchParamsObject,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import {
  createBusinessContactSchema,
  listBusinessQuerySchema,
} from "@/core/business/schema";
import {
  createUserBusinessContact,
  listUserBusinessContacts,
} from "@/core/business/service";
import { created, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("business");

export async function GET(req: Request) {
  try {
    const user = await requireWorkspaceUser("business");
    const rateLimit = await limits.enforceRead(user.id);
    const query = parseJsonBody(
      searchParamsObject(new URL(req.url).searchParams),
      listBusinessQuerySchema,
    );
    const contacts = await listUserBusinessContacts(user.id, query);
    return withRateLimitHeaders(ok({ contacts }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireWorkspaceUser("business");
    const rateLimit = await limits.enforceWrite(user.id);
    const body = parseJsonBody(await readJsonBody(req), createBusinessContactSchema);
    const contact = await createUserBusinessContact(user.id, body);
    return withRateLimitHeaders(created({ contact }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
