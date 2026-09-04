import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  searchParamsObject,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { createWriterDocumentSchema, listWriterQuerySchema } from "@/core/writer/schema";
import { createWriterDocument, listWriterDocuments } from "@/core/writer/service";
import { created, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("writer");

export async function GET(req: Request) {
  try {
    const user = await requireWorkspaceUser("writer");
    const rateLimit = await limits.enforceRead(user.id);
    const query = parseJsonBody(searchParamsObject(new URL(req.url).searchParams), listWriterQuerySchema);
    const documents = await listWriterDocuments(user.id, query);
    return withRateLimitHeaders(ok({ documents }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireWorkspaceUser("writer");
    const rateLimit = await limits.enforceWrite(user.id);
    const body = parseJsonBody(await readJsonBody(req), createWriterDocumentSchema);
    const document = await createWriterDocument(user.id, body);
    return withRateLimitHeaders(created({ document }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
