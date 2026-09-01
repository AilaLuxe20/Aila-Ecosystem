import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  searchParamsObject,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { createFinanceBudgetSchema, listFinanceQuerySchema } from "@/core/finance/schema";
import { createFinanceBudget, listFinanceBudgets } from "@/core/finance/service";
import { created, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("finance");

export async function GET(req: Request) {
  try {
    const user = await requireWorkspaceUser("finance");
    const rateLimit = await limits.enforceRead(user.id);
    const query = parseJsonBody(searchParamsObject(new URL(req.url).searchParams), listFinanceQuerySchema);
    const budgets = await listFinanceBudgets(user.id, query);
    return withRateLimitHeaders(ok({ budgets }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireWorkspaceUser("finance");
    const rateLimit = await limits.enforceWrite(user.id);
    const body = parseJsonBody(await readJsonBody(req), createFinanceBudgetSchema);
    const budget = await createFinanceBudget(user.id, body);
    return withRateLimitHeaders(created({ budget }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
