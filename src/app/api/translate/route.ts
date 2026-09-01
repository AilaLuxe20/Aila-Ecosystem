import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  searchParamsObject,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { createTranslateSchema, listTranslateQuerySchema } from "@/core/translate/schema";
import { createTranslateEntry, listTranslateEntries } from "@/core/translate/service";
import { created, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("translate");

export async function GET(req: Request) {
  try {
    const user = await requireWorkspaceUser("translate");
    const rateLimit = await limits.enforceRead(user.id);
    const query = parseJsonBody(searchParamsObject(new URL(req.url).searchParams), listTranslateQuerySchema);
    const translations = await listTranslateEntries(user.id, query);
    return withRateLimitHeaders(ok({ translations }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireWorkspaceUser("translate");
    const rateLimit = await limits.enforceWrite(user.id);
    const body = parseJsonBody(await readJsonBody(req), createTranslateSchema);
    const translation = await createTranslateEntry(user.id, body);
    return withRateLimitHeaders(created({ translation }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
