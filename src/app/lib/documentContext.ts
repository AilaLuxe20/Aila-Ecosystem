type DocumentContext = {
  fileName: string;
  text: string;
};

// Scoped by sessionId so concurrent users/requests never share state.
// Swap sessionId for an authenticated user id once auth is added.
const documentStore = new Map<string, DocumentContext>();

const EMPTY_DOCUMENT: DocumentContext = { fileName: "", text: "" };

export function saveDocument(
  sessionId: string,
  fileName: string,
  text: string
): void {
  documentStore.set(sessionId, { fileName, text });
}

export function getDocument(sessionId: string): DocumentContext {
  return documentStore.get(sessionId) ?? EMPTY_DOCUMENT;
}

export function hasDocument(sessionId: string): boolean {
  return (documentStore.get(sessionId)?.text.trim().length ?? 0) > 0;
}

export function clearDocument(sessionId: string): void {
  documentStore.delete(sessionId);
}