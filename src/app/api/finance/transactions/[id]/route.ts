import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { financeIdSchema, updateFinanceTransactionSchema } from "@/core/finance/schema";
import { deleteFinanceTransaction, updateFinanceTransaction } from "@/core/finance/service";
import { noContent, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("finance");

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("finance");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    const transaction = await updateFinanceTransaction(
      user.id,
      parseJsonBody(id, financeIdSchema),
      parseJsonBody(await readJsonBody(req), updateFinanceTransactionSchema),
    );
    return withRateLimitHeaders(ok({ transaction }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("finance");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    await deleteFinanceTransaction(user.id, parseJsonBody(id, financeIdSchema));
    return withRateLimitHeaders(noContent(), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
