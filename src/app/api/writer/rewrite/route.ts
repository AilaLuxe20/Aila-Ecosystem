import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { rewriteWriterDocumentSchema } from "@/core/writer/schema";
import { rewriteWriterText } from "@/core/writer/service";
import { ok } from "@/server/http/responses";

const limits = createProductRateLimiters("writer-rewrite");

export async function POST(req: Request) {
  try {
    const user = await requireWorkspaceUser("writer");
    const rateLimit = await limits.enforceWrite(user.id);
    const body = parseJsonBody(await readJsonBody(req), rewriteWriterDocumentSchema);
    const text = await rewriteWriterText(body.instruction, body.body);
    return withRateLimitHeaders(ok({ text }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
