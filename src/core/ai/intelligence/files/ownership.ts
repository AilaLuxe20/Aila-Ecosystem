import type { IntelligenceFileKind } from "./kinds";

export type IntelligenceDocumentRecord = {
  id: string;
  userId: string;
  conversationId: string | null;
  fileName: string;
  fileSize: number;
  mimeType: string;
  kind: IntelligenceFileKind;
  extractedText: string;
  extractedCharCount: number;
  truncated: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type IntelligenceDocumentMeta = {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  kind: IntelligenceFileKind;
  truncated: boolean;
  extractedCharCount: number;
};

export function toDocumentMeta(
  record: IntelligenceDocumentRecord
): IntelligenceDocumentMeta {
  return {
    id: record.id,
    fileName: record.fileName,
    fileSize: record.fileSize,
    mimeType: record.mimeType,
    kind: record.kind,
    truncated: record.truncated,
    extractedCharCount: record.extractedCharCount,
  };
}

export function canAccessIntelligenceDocument(
  record: IntelligenceDocumentRecord,
  userId: string
): boolean {
  return record.userId === userId;
}

export function canUseDocumentInConversation(
  record: IntelligenceDocumentRecord,
  userId: string,
  conversationId?: string
): boolean {
  if (!canAccessIntelligenceDocument(record, userId)) {
    return false;
  }

  if (!record.conversationId) {
    return true;
  }

  if (!conversationId) {
    return false;
  }

  return record.conversationId === conversationId;
}
