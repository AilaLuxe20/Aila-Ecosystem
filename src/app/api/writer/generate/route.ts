import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { generateWriterSchema } from "@/core/writer/schema";
import { generateWriterContent } from "@/core/writer/books";
import { ok } from "@/server/http/responses";

const limits = createProductRateLimiters("writer-generate");

export async function POST(req: Request) {
  try {
    const user = await requireWorkspaceUser("writer");
    const rateLimit = await limits.enforceWrite(user.id);
    const body = parseJsonBody(await readJsonBody(req), generateWriterSchema);
    const result = await generateWriterContent(user.id, body);
    return withRateLimitHeaders(ok(result), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
