import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { automationIdSchema, updateAutomationRuleSchema } from "@/core/automation/schema";
import {
  deleteUserAutomationRule,
  updateUserAutomationRule,
} from "@/core/automation/service";
import { noContent, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("automation");

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser();
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    const rule = await updateUserAutomationRule(
      user.id,
      parseJsonBody(id, automationIdSchema),
      parseJsonBody(await readJsonBody(req), updateAutomationRuleSchema),
    );
    return withRateLimitHeaders(ok({ rule }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser();
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    await deleteUserAutomationRule(user.id, parseJsonBody(id, automationIdSchema));
    return withRateLimitHeaders(noContent(), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
