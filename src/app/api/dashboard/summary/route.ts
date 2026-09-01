import {
  createProductRateLimiters,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { getDashboardSummary } from "@/core/dashboard/service";
import { getActorRole } from "@/lib/auth/require-product-access";
import { ok } from "@/server/http/responses";

const limits = createProductRateLimiters("dashboard");

export async function GET() {
  try {
    const user = await requireWorkspaceUser();
    const rateLimit = await limits.enforceRead(user.id);
    const role = (await getActorRole()) ?? "user";
    const summary = await getDashboardSummary(user.id, role);
    return withRateLimitHeaders(ok({ summary }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
