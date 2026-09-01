import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  searchParamsObject,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { createFinanceTransactionSchema, listFinanceQuerySchema } from "@/core/finance/schema";
import { createFinanceTransaction, listFinanceTransactions } from "@/core/finance/service";
import { created, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("finance");

export async function GET(req: Request) {
  try {
    const user = await requireWorkspaceUser("finance");
    const rateLimit = await limits.enforceRead(user.id);
    const query = parseJsonBody(searchParamsObject(new URL(req.url).searchParams), listFinanceQuerySchema);
    const transactions = await listFinanceTransactions(user.id, query);
    return withRateLimitHeaders(ok({ transactions }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireWorkspaceUser("finance");
    const rateLimit = await limits.enforceWrite(user.id);
    const body = parseJsonBody(await readJsonBody(req), createFinanceTransactionSchema);
    const transaction = await createFinanceTransaction(user.id, body);
    return withRateLimitHeaders(created({ transaction }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
