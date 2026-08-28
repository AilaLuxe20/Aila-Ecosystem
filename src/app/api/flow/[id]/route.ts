import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { flowIdSchema, updateFlowSchema } from "@/core/flow/schema";
import { deleteUserFlow, updateUserFlow } from "@/core/flow/service";
import { noContent, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("flow");

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("flow");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    const flow = await updateUserFlow(
      user.id,
      parseJsonBody(id, flowIdSchema),
      parseJsonBody(await readJsonBody(req), updateFlowSchema),
    );
    return withRateLimitHeaders(ok({ flow }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("flow");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    await deleteUserFlow(user.id, parseJsonBody(id, flowIdSchema));
    return withRateLimitHeaders(noContent(), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
