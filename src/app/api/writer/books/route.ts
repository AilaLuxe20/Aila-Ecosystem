import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { createWriterBookSchema } from "@/core/writer/schema";
import { createWriterBook, listWriterBooks } from "@/core/writer/books";
import { created, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("writer-books");

export async function GET() {
  try {
    const user = await requireWorkspaceUser("writer");
    const rateLimit = await limits.enforceRead(user.id);
    const books = await listWriterBooks(user.id);
    return withRateLimitHeaders(ok({ books }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireWorkspaceUser("writer");
    const rateLimit = await limits.enforceWrite(user.id);
    const body = parseJsonBody(await readJsonBody(req), createWriterBookSchema);
    const book = await createWriterBook(user.id, body);
    return withRateLimitHeaders(created({ book }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
