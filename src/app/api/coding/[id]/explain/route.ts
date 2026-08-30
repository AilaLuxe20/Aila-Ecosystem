import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { codingIdSchema, explainCodingFileSchema } from "@/core/coding/schema";
import { explainCodingFile } from "@/core/coding/service";
import { ok } from "@/server/http/responses";

const limits = createProductRateLimiters("coding-explain");

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("coding");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    const body = parseJsonBody(await readJsonBody(req), explainCodingFileSchema);
    const text = await explainCodingFile(user.id, parseJsonBody(id, codingIdSchema), body.fileId);
    return withRateLimitHeaders(ok({ text }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
