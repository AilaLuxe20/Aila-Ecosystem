import {
  createProductRateLimiters,
  parseJsonBody,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { flowIdSchema } from "@/core/flow/schema";
import { advanceUserFlow } from "@/core/flow/service";
import { ok } from "@/server/http/responses";

const limits = createProductRateLimiters("flow");

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("flow");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    const flow = await advanceUserFlow(user.id, parseJsonBody(id, flowIdSchema));
    return withRateLimitHeaders(ok({ flow }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
