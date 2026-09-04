/**
 * Legacy in-memory document holder.
 *
 * Live Legal and Intelligence uploads persist to Prisma, scoped to the signed-in
 * user. This module is kept only so older imports keep compiling. It must not
 * be used as shared request state — a process-global document would leak
 * between users.
 */

export type DocumentContext = {
  fileName: string;
  text: string;
};

const emptyDocument: DocumentContext = {
  fileName: "",
  text: "",
};

export function saveDocument(fileName: string, text: string): void {
  void fileName;
  void text;
}

export function getDocument(): DocumentContext {
  return emptyDocument;
}

export function hasDocument(): boolean {
  return false;
}

export function clearDocument(): void {
  // No process-global document is stored.
}
