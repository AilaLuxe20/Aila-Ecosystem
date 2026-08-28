import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  searchParamsObject,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { createFlowSchema, listFlowsQuerySchema } from "@/core/flow/schema";
import { createUserFlow, listUserFlows } from "@/core/flow/service";
import { created, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("flow");

export async function GET(req: Request) {
  try {
    const user = await requireWorkspaceUser("flow");
    const rateLimit = await limits.enforceRead(user.id);
    const query = parseJsonBody(
      searchParamsObject(new URL(req.url).searchParams),
      listFlowsQuerySchema,
    );
    const flows = await listUserFlows(user.id, query);
    return withRateLimitHeaders(ok({ flows }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireWorkspaceUser("flow");
    const rateLimit = await limits.enforceWrite(user.id);
    const body = parseJsonBody(await readJsonBody(req), createFlowSchema);
    const flow = await createUserFlow(user.id, body);
    return withRateLimitHeaders(created({ flow }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
