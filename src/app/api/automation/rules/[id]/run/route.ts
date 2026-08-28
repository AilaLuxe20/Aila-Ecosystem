import {
  createProductRateLimiters,
  parseJsonBody,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { automationIdSchema } from "@/core/automation/schema";
import { runUserAutomationRule } from "@/core/automation/service";
import { ok } from "@/server/http/responses";

const limits = createProductRateLimiters("automation");

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("automation");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    const run = await runUserAutomationRule(user.id, parseJsonBody(id, automationIdSchema));
    return withRateLimitHeaders(ok({ run }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
