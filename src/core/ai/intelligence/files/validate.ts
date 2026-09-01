import {
  MAX_DOCUMENT_SIZE,
  MAX_FILENAME_LENGTH,
} from "@/core/constants";
import { ERROR_CODES } from "@/lib/errors/app-error";
import { getFileExtension, sanitizeFileName } from "@/lib/utils/file";

import { looksLikeBinary, looksLikePdf } from "@/core/documents/bytes";

import {
  extensionToKind,
  INTELLIGENCE_KIND_MIME,
  type IntelligenceFileKind,
} from "./kinds";

export type IntelligenceFileValidation =
  | {
      ok: true;
      fileName: string;
      kind: IntelligenceFileKind;
      mimeType: string;
      fileSize: number;
    }
  | {
      ok: false;
      code: typeof ERROR_CODES.VALIDATION_FAILED;
      message: string;
    };

const WINDOWS_RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|$)/i;

function validateFileName(rawName: string): string | null {
  const trimmed = rawName.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.length > MAX_FILENAME_LENGTH) {
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
 * Server-side file checks. Client MIME types are ignored.
 */
export function validateIntelligenceFile(
  fileName: string,
  fileSize: number,
  bytes: Uint8Array
): IntelligenceFileValidation {
  if (fileSize <= 0 || bytes.length === 0) {
    return {
      ok: false,
      code: ERROR_CODES.VALIDATION_FAILED,
      message: "The uploaded file is empty.",
    };
  }

  if (fileSize > MAX_DOCUMENT_SIZE || bytes.length > MAX_DOCUMENT_SIZE) {
    return {
      ok: false,
      code: ERROR_CODES.VALIDATION_FAILED,
      message: "The file is too large. Please upload a file smaller than 10 MB.",
    };
  }

  const safeName = validateFileName(fileName);
  if (!safeName) {
    return {
      ok: false,
      code: ERROR_CODES.VALIDATION_FAILED,
      message: "That file name is not allowed.",
    };
  }

  const extension = getFileExtension(safeName);
  const kind = extensionToKind(extension);

  if (!kind) {
    return {
      ok: false,
      code: ERROR_CODES.VALIDATION_FAILED,
      message:
        "This file type is not supported. Attach a PDF, TXT, CSV, JSON, or Markdown file.",
    };
  }

  const pdfMagic = looksLikePdf(bytes);

  if (kind === "pdf") {
    if (!pdfMagic) {
      return {
        ok: false,
        code: ERROR_CODES.VALIDATION_FAILED,
        message: "The file does not look like a valid PDF.",
      };
    }
  } else if (pdfMagic || looksLikeBinary(bytes)) {
    return {
      ok: false,
      code: ERROR_CODES.VALIDATION_FAILED,
      message: "The file does not look like readable text.",
    };
  }

  return {
    ok: true,
    fileName: safeName,
    kind,
    mimeType: INTELLIGENCE_KIND_MIME[kind],
    fileSize: bytes.length,
  };
}
