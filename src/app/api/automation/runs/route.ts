import {
  createProductRateLimiters,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { listUserAutomationRuns } from "@/core/automation/service";
import { ok } from "@/server/http/responses";

const limits = createProductRateLimiters("automation");

export async function GET() {
  try {
    const user = await requireWorkspaceUser();
    const rateLimit = await limits.enforceRead(user.id);
    const runs = await listUserAutomationRuns(user.id);
    return withRateLimitHeaders(ok({ runs }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
