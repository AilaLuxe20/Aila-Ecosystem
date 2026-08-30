import {
  createProductRateLimiters,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { getFinanceWorkspace } from "@/core/finance/service";
import { ok } from "@/server/http/responses";

const limits = createProductRateLimiters("finance");

export async function GET() {
  try {
    const user = await requireWorkspaceUser("finance");
    const rateLimit = await limits.enforceRead(user.id);
    const workspace = await getFinanceWorkspace(user.id);
    return withRateLimitHeaders(
      ok({
        transactions: workspace.transactions,
        budgets: workspace.budgets,
        goals: workspace.goals,
        totals: workspace.totals,
      }),
      rateLimit,
    );
  } catch (error) {
    return workspaceFailure(error);
  }
}
