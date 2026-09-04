import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { createDailyTaskSchema } from "@/core/daily/schema";
import { createUserDailyTask } from "@/core/daily/service";
import { created } from "@/server/http/responses";

const limits = createProductRateLimiters("daily");

export async function POST(req: Request) {
  try {
    const user = await requireWorkspaceUser("daily");
    const rateLimit = await limits.enforceWrite(user.id);
    const body = parseJsonBody(await readJsonBody(req), createDailyTaskSchema);
    const task = await createUserDailyTask(user.id, body);
    return withRateLimitHeaders(created({ task }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
