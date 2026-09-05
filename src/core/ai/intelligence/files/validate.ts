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
  isRejectedVideoExtension,
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
const UNSUPPORTED_MESSAGE =
  "This file type is not supported. Attach a PDF, TXT, CSV, JSON, Markdown, image (PNG, JPEG, WEBP, GIF), audio note (MP3, WAV, OGG, M4A, WEBM), or short video (MP4, MOV, M4V).";

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

function ascii(bytes: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(start, start + length));
}

function sniffImageMime(bytes: Uint8Array): string | null {
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }

  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }

  if (bytes.length >= 6 && ascii(bytes, 0, 3) === "GIF") {
    return "image/gif";
  }

  if (
    bytes.length >= 12 &&
    ascii(bytes, 0, 4) === "RIFF" &&
    ascii(bytes, 8, 4) === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
}

function sniffAudioMime(bytes: Uint8Array, extension: string): string | null {
  if (bytes.length >= 3 && ascii(bytes, 0, 3) === "ID3") {
    return "audio/mpeg";
  }

  if (bytes.length >= 2 && bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0) {
    return "audio/mpeg";
  }

  if (
    bytes.length >= 12 &&
    ascii(bytes, 0, 4) === "RIFF" &&
    ascii(bytes, 8, 4) === "WAVE"
  ) {
    return "audio/wav";
  }

  if (bytes.length >= 4 && ascii(bytes, 0, 4) === "OggS") {
    return "audio/ogg";
  }

  if (
    bytes.length >= 12 &&
    ascii(bytes, 4, 4) === "ftyp" &&
    (extension === "m4a" || extension === "mp3")
  ) {
    return "audio/mp4";
  }

  if (bytes.length >= 4 && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf) {
    return "audio/webm";
  }

  if (extension === "webm" || extension === "ogg" || extension === "wav" || extension === "mp3" || extension === "m4a") {
    return INTELLIGENCE_KIND_MIME.audio;
  }

  return null;
}

function sniffVideoMime(bytes: Uint8Array, extension: string): string | null {
  if (bytes.length >= 12 && ascii(bytes, 4, 4) === "ftyp") {
    return extension === "mov" ? "video/quicktime" : "video/mp4";
  }

  if (extension === "mp4" || extension === "m4v" || extension === "mov") {
    return extension === "mov" ? "video/quicktime" : "video/mp4";
  }

  return null;
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

  if (isRejectedVideoExtension(extension)) {
    return {
      ok: false,
      code: ERROR_CODES.VALIDATION_FAILED,
      message:
        "This video container is not supported. Upload MP4, MOV, or M4V, or an audio recording instead.",
    };
  }

  const kind = extensionToKind(extension);

  if (!kind) {
    return {
      ok: false,
      code: ERROR_CODES.VALIDATION_FAILED,
      message: UNSUPPORTED_MESSAGE,
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

    return {
      ok: true,
      fileName: safeName,
      kind,
      mimeType: INTELLIGENCE_KIND_MIME.pdf,
      fileSize: bytes.length,
    };
  }

  if (kind === "image") {
    const mimeType = sniffImageMime(bytes);
    if (!mimeType) {
      return {
        ok: false,
        code: ERROR_CODES.VALIDATION_FAILED,
        message: "The file does not look like a valid image.",
      };
    }

    return {
      ok: true,
      fileName: safeName,
      kind,
      mimeType,
      fileSize: bytes.length,
    };
  }

  if (kind === "audio") {
    const mimeType = sniffAudioMime(bytes, extension);
    if (!mimeType) {
      return {
        ok: false,
        code: ERROR_CODES.VALIDATION_FAILED,
        message: "The file does not look like a valid audio recording.",
      };
    }

    return {
      ok: true,
      fileName: safeName,
      kind,
      mimeType,
      fileSize: bytes.length,
    };
  }

  if (kind === "video") {
    const mimeType = sniffVideoMime(bytes, extension);
    if (!mimeType) {
      return {
        ok: false,
        code: ERROR_CODES.VALIDATION_FAILED,
        message: "The file does not look like a valid video.",
      };
    }

    return {
      ok: true,
      fileName: safeName,
      kind,
      mimeType,
      fileSize: bytes.length,
    };
  }

  if (pdfMagic || looksLikeBinary(bytes)) {
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
