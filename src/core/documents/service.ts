import { extractIntelligenceText } from "@/core/ai/intelligence/files/extract";
import { extensionToKind, INTELLIGENCE_KIND_MIME } from "@/core/ai/intelligence/files/kinds";
import { INTELLIGENCE_ALLOWED_EXTENSIONS, MAX_DOCUMENT_SIZE } from "@/core/constants";
import { prisma } from "@/core/database/prisma";
import { NotFoundError, ValidationError } from "@/lib/errors/app-error";
import { getFileExtension, sanitizeFileName } from "@/lib/utils/file";

import {
  DOCUMENTS_LIST_LIMIT,
  DOCUMENT_TITLE_MAX,
  type ListDocumentsQuery,
  type UpdateDocumentNotesBody,
  type UploadDocumentFields,
} from "./schema";

export type LibraryDocumentDto = {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  extractedText: string;
  extractedCharCount: number;
  truncated: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateLibraryDocumentUpload = UploadDocumentFields & {
  fileName: string;
  fileSize: number;
  bytes: Uint8Array;
};

function serialize(record: {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  extractedText: string;
  extractedCharCount: number;
  truncated: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}): LibraryDocumentDto {
  return {
    id: record.id,
    title: record.title,
    fileName: record.fileName,
    fileSize: record.fileSize,
    mimeType: record.mimeType,
    extractedText: record.extractedText,
    extractedCharCount: record.extractedCharCount,
    truncated: record.truncated,
    notes: record.notes,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export async function listLibraryDocuments(userId: string, query: ListDocumentsQuery) {
  const records = await prisma.libraryDocument.findMany({
    where: {
      userId,
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: "insensitive" } },
              { fileName: { contains: query.q, mode: "insensitive" } },
              { extractedText: { contains: query.q, mode: "insensitive" } },
              { notes: { contains: query.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: query.limit ?? DOCUMENTS_LIST_LIMIT,
  });

  return records.map(serialize);
}

export function formatDocumentsAiContext(documents: LibraryDocumentDto[]): string {
  return [
    "AILA DOCUMENTS SNAPSHOT",
    documents.length
      ? documents
          .slice(0, 12)
          .map((document) => `${document.title} (${document.fileName}, ${document.extractedCharCount} chars)`)
          .join("; ")
      : "No uploaded documents.",
  ].join("\n");
}

export async function getLibraryDocument(userId: string, id: string) {
  const existing = await prisma.libraryDocument.findFirst({ where: { id, userId } });
  if (!existing) throw new NotFoundError("Document");
  return serialize(existing);
}

export async function createLibraryDocumentFromUpload(
  userId: string,
  input: CreateLibraryDocumentUpload,
) {
  if (input.fileSize <= 0 || input.bytes.length === 0) {
    throw new ValidationError({ file: "The uploaded file is empty." }, { message: "The uploaded file is empty." });
  }

  if (input.fileSize > MAX_DOCUMENT_SIZE || input.bytes.length > MAX_DOCUMENT_SIZE) {
    throw new ValidationError(
      { file: "The file is too large. Please upload a file smaller than 10 MB." },
      { message: "The file is too large. Please upload a file smaller than 10 MB." },
    );
  }

  const safeName = sanitizeFileName(input.fileName.trim());
  if (!safeName) {
    throw new ValidationError({ file: "That file name is not allowed." }, { message: "That file name is not allowed." });
  }

  const extension = getFileExtension(safeName);
  if (!(INTELLIGENCE_ALLOWED_EXTENSIONS as readonly string[]).includes(extension)) {
    throw new ValidationError(
      { file: "This file type is not supported. Attach a PDF, TXT, CSV, JSON, or Markdown file." },
      { message: "This file type is not supported. Attach a PDF, TXT, CSV, JSON, or Markdown file." },
    );
  }

  const kind = extensionToKind(extension);
  if (!kind) {
    throw new ValidationError(
      { file: "This file type is not supported. Attach a PDF, TXT, CSV, JSON, or Markdown file." },
      { message: "This file type is not supported. Attach a PDF, TXT, CSV, JSON, or Markdown file." },
    );
  }

  const extracted = await extractIntelligenceText(input.bytes, kind);
  if (!extracted.ok) {
    throw new ValidationError({ file: extracted.message }, { message: extracted.message });
  }

  const title = (input.title?.trim() || safeName).slice(0, DOCUMENT_TITLE_MAX);

  return serialize(
    await prisma.libraryDocument.create({
      data: {
        userId,
        title,
        fileName: safeName,
        fileSize: input.bytes.length,
        mimeType: INTELLIGENCE_KIND_MIME[kind],
        extractedText: extracted.data.text,
        extractedCharCount: extracted.data.extractedCharCount,
        truncated: extracted.data.truncated,
        notes: input.notes ?? null,
      },
    }),
  );
}

export async function updateLibraryDocumentNotes(
  userId: string,
  id: string,
  body: UpdateDocumentNotesBody,
) {
  await getLibraryDocument(userId, id);

  return serialize(
    await prisma.libraryDocument.update({
      where: { id },
      data: { notes: body.notes ?? null },
    }),
  );
}

export async function deleteLibraryDocument(userId: string, id: string) {
  await getLibraryDocument(userId, id);
  await prisma.libraryDocument.delete({ where: { id } });
}
