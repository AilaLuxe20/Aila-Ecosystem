/**
 * Single Document Engine.
 *
 * Consolidates all document upload and parsing logic into one pipeline.
 * Legal, Business, Automation, and Intelligence products all reuse
 * this same engine — no duplicated upload logic.
 *
 * Replaces the previous duplicate implementations:
 * - /api/legal-upload (document upload + analysis)
 * - /products/ailalegal/extract (PDF extraction)
 * - src/app/components/AilaLegalAnalyzer.tsx (upload + extract + analyze)
 * - src/app/components/DocumentAnalyzer.tsx (mock upload)
 * - src/app/products/ailalegal/components/DocumentUpload.tsx (upload + analysis)
 * - src/app/products/ailalegal/components/DocumentAnalyzer.tsx (mock upload)
 */

import { extractText } from "unpdf";
import {
  MAX_DOCUMENT_SIZE,
  ALLOWED_FILE_TYPES,
} from "@/core/constants";
import type { DocumentResult } from "@/core/types";
import { saveDocument, getDocument, hasDocument, clearDocument } from "@/core/ai/documentContext";

export type { DocumentContext } from "@/core/ai/documentContext";

/**
 * Validate an uploaded file.
 *
 * @param file - The uploaded file
 * @returns An error message if validation fails, or null if valid
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

  if (!isPdf && !isTextFile && !ALLOWED_FILE_TYPES.includes(file.type)) {
    return "This file type is not supported yet. Please upload a PDF or TXT document.";
  }

  return null;
}

/**
 * Extract text from an uploaded file.
 *
 * Supports PDF (via unpdf) and plain text files.
 *
 * @param file - The uploaded file
 * @returns The extracted text
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();
  const isPdf = fileName.endsWith(".pdf");

  if (isPdf) {
    const buffer = await file.arrayBuffer();
    const { text } = await extractText(new Uint8Array(buffer), {
      mergePages: true,
    });
    return text;
  }

  return await file.text();
}

/**
 * Process an uploaded document through the full pipeline:
 * 1. Validate the file
 * 2. Extract text
 * 3. Save to document context
 * 4. Return the result
 *
 * @param file - The uploaded file
 * @returns The document result with extracted text
 * @throws Error if validation or extraction fails
 */
export async function processDocument(file: File): Promise<DocumentResult> {
  const validationError = validateFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const extractedText = await extractTextFromFile(file);
  const cleanText = extractedText.trim();

  if (!cleanText) {
    throw new Error(
      "AilaLegal could not find readable text in this document. The file may contain scanned images and require OCR."
    );
  }

  // Save to shared document context
  saveDocument(file.name, cleanText);

  return {
    fileName: file.name,
    pages: 0, // Page count is only available for PDFs via unpdf's totalPages
    text: cleanText,
    size: file.size,
    type: file.type || "unknown",
  };
}

/**
 * Process a PDF file and return page count along with text.
 * Used by the extract endpoint for backward compatibility.
 */
export async function extractPdf(file: File): Promise<{
  text: string;
  totalPages: number;
}> {
  const validationError = validateFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const buffer = await file.arrayBuffer();
  const { text, totalPages } = await extractText(new Uint8Array(buffer), {
    mergePages: true,
  });

  const cleanText = text.trim();

  if (!cleanText) {
    throw new Error(
      "AilaLegal could not find readable text in this document. The file may contain scanned images and require OCR."
    );
  }

  // Save to shared document context
  saveDocument(file.name, cleanText);

  return {
    text: cleanText,
    totalPages,
  };
}

// Re-export document context functions for convenience
export { getDocument, hasDocument, clearDocument };
