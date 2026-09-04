import {
  createProductRateLimiters,
  parseJsonBody,
  requireWorkspaceUser,
  searchParamsObject,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { listDocumentsQuerySchema, uploadDocumentFieldsSchema } from "@/core/documents/schema";
import { createLibraryDocumentFromUpload, listLibraryDocuments } from "@/core/documents/service";
import { ValidationError } from "@/lib/errors/app-error";
import { created, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("documents");

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(req: Request) {
  try {
    const user = await requireWorkspaceUser("documents");
    const rateLimit = await limits.enforceRead(user.id);
    const query = parseJsonBody(searchParamsObject(new URL(req.url).searchParams), listDocumentsQuerySchema);
    const documents = await listLibraryDocuments(user.id, query);
    return withRateLimitHeaders(ok({ documents }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireWorkspaceUser("documents");
    const rateLimit = await limits.enforceWrite(user.id);

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      throw new ValidationError({}, { message: "Request must be multipart form data." });
    }

    const uploaded = formData.get("file");
    if (!(uploaded instanceof File)) {
      throw new ValidationError({ file: "Please attach a file." }, { message: "Please attach a file." });
    }

    const titleValue = formData.get("title");
    const notesValue = formData.get("notes");
    const fields = parseJsonBody(
      {
        ...(typeof titleValue === "string" ? { title: titleValue } : {}),
        ...(typeof notesValue === "string" ? { notes: notesValue } : {}),
      },
      uploadDocumentFieldsSchema,
    );

    const bytes = new Uint8Array(await uploaded.arrayBuffer());
    const document = await createLibraryDocumentFromUpload(user.id, {
      fileName: uploaded.name,
      fileSize: uploaded.size,
      bytes,
      title: fields.title,
      notes: fields.notes,
    });
    return withRateLimitHeaders(created({ document }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
