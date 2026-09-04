import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { financeIdSchema, updateFinanceGoalSchema } from "@/core/finance/schema";
import { deleteFinanceGoal, updateFinanceGoal } from "@/core/finance/service";
import { noContent, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("finance");

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("finance");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    const goal = await updateFinanceGoal(
      user.id,
      parseJsonBody(id, financeIdSchema),
      parseJsonBody(await readJsonBody(req), updateFinanceGoalSchema),
    );
    return withRateLimitHeaders(ok({ goal }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("finance");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    await deleteFinanceGoal(user.id, parseJsonBody(id, financeIdSchema));
    return withRateLimitHeaders(noContent(), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
