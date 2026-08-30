import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { createDailyNoteSchema } from "@/core/daily/schema";
import { createUserDailyNote } from "@/core/daily/service";
import { created } from "@/server/http/responses";

const limits = createProductRateLimiters("daily");

export async function POST(req: Request) {
  try {
    const user = await requireWorkspaceUser("daily");
    const rateLimit = await limits.enforceWrite(user.id);
    const body = parseJsonBody(await readJsonBody(req), createDailyNoteSchema);
    const note = await createUserDailyNote(user.id, body);
    return withRateLimitHeaders(created({ note }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
