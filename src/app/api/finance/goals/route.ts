import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  searchParamsObject,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { createFinanceGoalSchema, listFinanceQuerySchema } from "@/core/finance/schema";
import { createFinanceGoal, listFinanceGoals } from "@/core/finance/service";
import { created, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("finance");

export async function GET(req: Request) {
  try {
    const user = await requireWorkspaceUser("finance");
    const rateLimit = await limits.enforceRead(user.id);
    const query = parseJsonBody(searchParamsObject(new URL(req.url).searchParams), listFinanceQuerySchema);
    const goals = await listFinanceGoals(user.id, query);
    return withRateLimitHeaders(ok({ goals }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireWorkspaceUser("finance");
    const rateLimit = await limits.enforceWrite(user.id);
    const body = parseJsonBody(await readJsonBody(req), createFinanceGoalSchema);
    const goal = await createFinanceGoal(user.id, body);
    return withRateLimitHeaders(created({ goal }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
