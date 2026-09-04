import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { createDailyGoalSchema } from "@/core/daily/schema";
import { createUserDailyGoal } from "@/core/daily/service";
import { created } from "@/server/http/responses";

const limits = createProductRateLimiters("daily");

export async function POST(req: Request) {
  try {
    const user = await requireWorkspaceUser("daily");
    const rateLimit = await limits.enforceWrite(user.id);
    const body = parseJsonBody(await readJsonBody(req), createDailyGoalSchema);
    const goal = await createUserDailyGoal(user.id, body);
    return withRateLimitHeaders(created({ goal }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
