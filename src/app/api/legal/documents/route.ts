import {
  createProductRateLimiters,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { listLegalDocuments } from "@/core/legal/service";
import { ok } from "@/server/http/responses";

const limits = createProductRateLimiters("legal");

export async function GET() {
  try {
    const user = await requireWorkspaceUser("ailalegal");
    const rateLimit = await limits.enforceRead(user.id);
    const documents = await listLegalDocuments(user.id);
    return withRateLimitHeaders(ok({ documents }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
