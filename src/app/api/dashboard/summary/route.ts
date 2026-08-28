import {
  createProductRateLimiters,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { getDashboardSummary } from "@/core/dashboard/service";
import { ok } from "@/server/http/responses";

const limits = createProductRateLimiters("dashboard");

export async function GET() {
  try {
    const user = await requireWorkspaceUser();
    const rateLimit = await limits.enforceRead(user.id);
    const summary = await getDashboardSummary(user.id);
    return withRateLimitHeaders(ok({ summary }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
