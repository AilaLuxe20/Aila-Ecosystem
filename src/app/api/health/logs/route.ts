import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  searchParamsObject,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { createHealthLogSchema, listHealthQuerySchema } from "@/core/health/schema";
import { createHealthLog, listHealthLogs } from "@/core/health/service";
import { created, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("health");

export async function GET(req: Request) {
  try {
    const user = await requireWorkspaceUser("health");
    const rateLimit = await limits.enforceRead(user.id);
    const query = parseJsonBody(searchParamsObject(new URL(req.url).searchParams), listHealthQuerySchema);
    const logs = await listHealthLogs(user.id, query);
    return withRateLimitHeaders(ok({ logs }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireWorkspaceUser("health");
    const rateLimit = await limits.enforceWrite(user.id);
    const body = parseJsonBody(await readJsonBody(req), createHealthLogSchema);
    const log = await createHealthLog(user.id, body);
    return withRateLimitHeaders(created({ log }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
