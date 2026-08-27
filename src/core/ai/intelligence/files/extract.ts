import { extractPdfTextFromBytes } from "@/core/ai/documentEngine";
import {
  INTELLIGENCE_EXTRACT_TIMEOUT_MS,
  MAX_EXTRACTED_TEXT_CHARS,
} from "@/core/constants";
import { ERROR_CODES } from "@/lib/errors/app-error";

import type { IntelligenceFileKind } from "./kinds";

export type ExtractedIntelligenceText = {
  text: string;
  extractedCharCount: number;
  truncated: boolean;
};

export type ExtractResult =
  | { ok: true; data: ExtractedIntelligenceText }
  | {
      ok: false;
      code: typeof ERROR_CODES.VALIDATION_FAILED | typeof ERROR_CODES.TIMEOUT;
      message: string;
    };

function decodeUtf8(bytes: Uint8Array): string {
  const text = new TextDecoder("utf-8").decode(bytes);
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

export function truncateExtractedText(text: string): ExtractedIntelligenceText {
  if (text.length <= MAX_EXTRACTED_TEXT_CHARS) {
    return {
      text,
      extractedCharCount: text.length,
      truncated: false,
    };
  }

  return {
    text: text.slice(0, MAX_EXTRACTED_TEXT_CHARS),
    extractedCharCount: MAX_EXTRACTED_TEXT_CHARS,
    truncated: true,
  };
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

export async function extractIntelligenceText(
  bytes: Uint8Array,
  kind: IntelligenceFileKind
): Promise<ExtractResult> {
  try {
    const raw = await withTimeout(
      kind === "pdf"
        ? extractPdfTextFromBytes(bytes)
        : Promise.resolve(decodeUtf8(bytes)),
      INTELLIGENCE_EXTRACT_TIMEOUT_MS,
      "Document processing timed out."
    );

    const cleanText = raw.replace(/\u0000/g, "").trim();

    if (!cleanText) {
      return {
        ok: false,
        code: ERROR_CODES.VALIDATION_FAILED,
        message:
          kind === "pdf"
            ? "Aila could not find readable text in this PDF. Scanned images are not supported yet."
            : "The uploaded file did not contain readable text.",
      };
    }

    if (kind === "json") {
      try {
        JSON.parse(cleanText);
      } catch {
        return {
          ok: false,
          code: ERROR_CODES.VALIDATION_FAILED,
          message: "The JSON file could not be parsed.",
        };
      }

      if (cleanText.length > MAX_EXTRACTED_TEXT_CHARS) {
        return {
          ok: false,
          code: ERROR_CODES.VALIDATION_FAILED,
          message:
            "This JSON file is larger than the 100,000 character limit. Please attach a smaller file.",
        };
      }
    }

    return {
      ok: true,
      data: truncateExtractedText(cleanText),
    };
  } catch (error) {
    const message =
      error instanceof Error && error.message === "Document processing timed out."
        ? error.message
        : "Aila could not read this file.";

    return {
      ok: false,
      code:
        message === "Document processing timed out."
          ? ERROR_CODES.TIMEOUT
          : ERROR_CODES.VALIDATION_FAILED,
      message,
    };
  }
}
