/**
 * Document upload and text extraction for Legal (and shared PDF helpers).
 *
 * Extracted text is returned to the caller. Persistence is the caller's
 * responsibility (Prisma, per user). This module does not write process-global
 * document state.
 */

import { extractText } from "unpdf";

import { MAX_DOCUMENT_SIZE } from "@/core/constants";
import { looksLikeBinary, looksLikePdf } from "@/core/documents/bytes";
import type { DocumentResult } from "@/core/types";
import { ValidationError } from "@/lib/errors/app-error";
import { getFileExtension, sanitizeFileName } from "@/lib/utils/file";

export type LegalDocumentKind = "pdf" | "txt";

export type LegalFileValidation =
  | {
      ok: true;
      fileName: string;
      kind: LegalDocumentKind;
      mimeType: string;
      fileSize: number;
    }
  | { ok: false; message: string };

const WINDOWS_RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|$)/i;

function sanitizeLegalFileName(rawName: string): string | null {
  const trimmed = rawName.trim();
  if (!trimmed || trimmed.length > 255) {
    return null;
  }

  if (/[\\/\x00-\x1f]/.test(trimmed) || trimmed.includes("..")) {
    return null;
  }

  const sanitised = sanitizeFileName(trimmed);
  if (!sanitised || WINDOWS_RESERVED.test(sanitised)) {
    return null;
  }

  return sanitised;
}

/**
 * Server-side Legal upload checks. Client MIME types are ignored.
 */
export function validateLegalDocumentFile(
  fileName: string,
  fileSize: number,
  bytes: Uint8Array,
): LegalFileValidation {
  if (fileSize <= 0 || bytes.length === 0) {
    return { ok: false, message: "The uploaded document is empty." };
  }

  if (fileSize > MAX_DOCUMENT_SIZE || bytes.length > MAX_DOCUMENT_SIZE) {
    return {
      ok: false,
      message: "The document is too large. Please upload a file smaller than 10 MB.",
    };
  }

  const safeName = sanitizeLegalFileName(fileName);
  if (!safeName) {
    return { ok: false, message: "That file name is not allowed." };
  }

  const extension = getFileExtension(safeName);
  const kind: LegalDocumentKind | null =
    extension === "pdf" ? "pdf" : extension === "txt" ? "txt" : null;

  if (!kind) {
    return {
      ok: false,
      message: "This file type is not supported yet. Please upload a PDF or TXT document.",
    };
  }

  const pdfMagic = looksLikePdf(bytes);

  if (kind === "pdf") {
    if (!pdfMagic) {
      return { ok: false, message: "The file does not look like a valid PDF." };
    }
  } else if (pdfMagic || looksLikeBinary(bytes)) {
    return { ok: false, message: "The file does not look like readable text." };
  }

  return {
    ok: true,
    fileName: safeName,
    kind,
    mimeType: kind === "pdf" ? "application/pdf" : "text/plain",
    fileSize: bytes.length,
  };
}

/**
 * @deprecated Use {@link validateLegalDocumentFile} with file bytes.
 */
export function validateFile(file: File): string | null {
  if (!file) {
    return "No document uploaded.";
  }

  if (file.size === 0) {
    return "The uploaded document is empty.";
  }

  if (file.size > MAX_DOCUMENT_SIZE) {
    return "The document is too large. Please upload a file smaller than 10 MB.";
  }

  const fileName = file.name.toLowerCase();
  const isPdf = fileName.endsWith(".pdf");
  const isTextFile = fileName.endsWith(".txt");

  if (!isPdf && !isTextFile) {
    return "This file type is not supported yet. Please upload a PDF or TXT document.";
  }

  return null;
}

export async function extractPdfTextFromBytes(
  bytes: Uint8Array,
): Promise<string> {
  const { text } = await extractText(bytes, {
    mergePages: true,
  });
  return text;
}

export async function extractPdfPagesFromBytes(bytes: Uint8Array): Promise<{
  text: string;
  totalPages: number;
}> {
  return extractText(bytes, {
    mergePages: true,
  });
}

/**
 * Validate, extract text, and return the document. Does not persist.
 */
export async function processDocument(file: File): Promise<DocumentResult> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const validated = validateLegalDocumentFile(file.name, file.size, bytes);

  if (!validated.ok) {
    throw new ValidationError({ file: validated.message }, { message: validated.message });
  }

  const extractedText =
    validated.kind === "pdf"
      ? await extractPdfTextFromBytes(bytes)
      : new TextDecoder("utf-8").decode(bytes);

  const cleanText = extractedText.trim();

  if (!cleanText) {
    throw new ValidationError(
      { file: "empty" },
      {
        message:
          "Aila Legal could not find readable text in this document. The file may contain scanned images and require OCR.",
      },
    );
  }

  return {
    fileName: validated.fileName,
    pages: 0,
    text: cleanText,
    size: validated.fileSize,
    type: validated.mimeType,
  };
}

/**
 * Process a PDF and return page count with text. Does not persist.
 */
export async function extractPdf(file: File): Promise<{
  text: string;
  totalPages: number;
}> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const validated = validateLegalDocumentFile(file.name, file.size, bytes);

  if (!validated.ok) {
    throw new ValidationError({ file: validated.message }, { message: validated.message });
  }

  if (validated.kind !== "pdf") {
    throw new ValidationError(
      { file: "not-pdf" },
      { message: "This endpoint only accepts PDF documents." },
    );
  }

  const { text, totalPages } = await extractPdfPagesFromBytes(bytes);
  const cleanText = text.trim();

  if (!cleanText) {
    throw new ValidationError(
      { file: "empty" },
      {
        message:
          "Aila Legal could not find readable text in this document. The file may contain scanned images and require OCR.",
      },
    );
  }

  return {
    text: cleanText,
    totalPages,
  };
}
