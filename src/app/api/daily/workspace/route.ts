import {
  createProductRateLimiters,
  parseJsonBody,
  requireWorkspaceUser,
  searchParamsObject,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { dailyWorkspaceQuerySchema } from "@/core/daily/schema";
import { getDailyWorkspace } from "@/core/daily/service";
import { ok } from "@/server/http/responses";

const limits = createProductRateLimiters("daily");

export async function GET(req: Request) {
  try {
    const user = await requireWorkspaceUser("daily");
    const rateLimit = await limits.enforceRead(user.id);
    const query = parseJsonBody(
      searchParamsObject(new URL(req.url).searchParams),
      dailyWorkspaceQuerySchema,
    );
    const workspace = await getDailyWorkspace(user.id, query.timezone);
    return withRateLimitHeaders(ok({ workspace }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
