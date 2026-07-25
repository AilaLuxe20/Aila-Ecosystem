/**
 * Document context manager.
 *
 * Moved from src/app/lib/documentContext.ts to core.
 * Provides an in-memory store for the currently uploaded document,
 * shared across all Aila products.
 */

export type DocumentContext = {
  fileName: string;
  text: string;
};

let currentDocument: DocumentContext = {
  fileName: "",
  text: "",
};

export function saveDocument(
  fileName: string,
  text: string
): void {
  currentDocument = {
    fileName,
    text,
  };
}

export function getDocument(): DocumentContext {
  return currentDocument;
}

export function hasDocument(): boolean {
  return currentDocument.text.trim().length > 0;
}

export function clearDocument(): void {
  currentDocument = {
    fileName: "",
    text: "",
  };
}
