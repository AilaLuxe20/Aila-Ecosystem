import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  searchParamsObject,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { createBusinessTaskSchema, listBusinessQuerySchema } from "@/core/business/schema";
import { createUserBusinessTask, listUserBusinessTasks } from "@/core/business/service";
import { created, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("business");

export async function GET(req: Request) {
  try {
    const user = await requireWorkspaceUser();
    const rateLimit = await limits.enforceRead(user.id);
    const query = parseJsonBody(
      searchParamsObject(new URL(req.url).searchParams),
      listBusinessQuerySchema,
    );
    const tasks = await listUserBusinessTasks(user.id, query);
    return withRateLimitHeaders(ok({ tasks }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireWorkspaceUser();
    const rateLimit = await limits.enforceWrite(user.id);
    const body = parseJsonBody(await readJsonBody(req), createBusinessTaskSchema);
    const task = await createUserBusinessTask(user.id, body);
    return withRateLimitHeaders(created({ task }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
