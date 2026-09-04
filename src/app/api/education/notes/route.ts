import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  searchParamsObject,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { createEducationNoteSchema, listEducationQuerySchema } from "@/core/education/schema";
import { createEducationNote, listEducationNotes } from "@/core/education/service";
import { created, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("education");

export async function GET(req: Request) {
  try {
    const user = await requireWorkspaceUser("education");
    const rateLimit = await limits.enforceRead(user.id);
    const query = parseJsonBody(
      searchParamsObject(new URL(req.url).searchParams),
      listEducationQuerySchema,
    );
    const notes = await listEducationNotes(user.id, query);
    return withRateLimitHeaders(ok({ notes }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireWorkspaceUser("education");
    const rateLimit = await limits.enforceWrite(user.id);
    const body = parseJsonBody(await readJsonBody(req), createEducationNoteSchema);
    const note = await createEducationNote(user.id, body);
    return withRateLimitHeaders(created({ note }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
