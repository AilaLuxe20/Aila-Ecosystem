import { getUserConversation } from "@/core/ai/conversation/service";
import {
  MAX_INTELLIGENCE_ATTACHMENTS,
} from "@/core/constants";
import type { AilaMode } from "@/core/types";
import { ERROR_CODES } from "@/lib/errors/app-error";

import {
  buildBoundedDocumentContext,
  formatDocumentPromptBlock,
  type BoundedDocumentContext,
} from "./context";
import { extractIntelligenceText } from "./extract";
import {
  canUseDocumentInConversation,
  toDocumentMeta,
  type IntelligenceDocumentMeta,
} from "./ownership";
import {
  prismaIntelligenceDocumentStore,
  type IntelligenceDocumentStore,
} from "./store";
import { validateIntelligenceFile } from "./validate";

export type IntelligenceFileErrorCode =
  | typeof ERROR_CODES.VALIDATION_FAILED
  | typeof ERROR_CODES.NOT_FOUND
  | typeof ERROR_CODES.CONFLICT
  | typeof ERROR_CODES.TIMEOUT
  | typeof ERROR_CODES.EXTERNAL_SERVICE_ERROR;

export type IntelligenceFileFailure = {
  ok: false;
  status: number;
  code: IntelligenceFileErrorCode;
  message: string;
};

export type ProcessIntelligenceUploadResult =
  | { ok: true; document: IntelligenceDocumentMeta }
  | IntelligenceFileFailure;

export type ResolvedIntelligenceDocuments =
  | {
      ok: true;
      records: Awaited<
        ReturnType<IntelligenceDocumentStore["findByConversation"]>
      >;
    }
  | IntelligenceFileFailure;

function fail(
  status: number,
  code: IntelligenceFileErrorCode,
  message: string
): IntelligenceFileFailure {
  return { ok: false, status, code, message };
}

export async function processIntelligenceUpload(options: {
  userId: string;
  fileName: string;
  fileSize: number;
  bytes: Uint8Array;
  conversationId?: string;
  mode?: AilaMode;
  store?: IntelligenceDocumentStore;
  getConversation?: typeof getUserConversation;
}): Promise<ProcessIntelligenceUploadResult> {
  const store = options.store ?? prismaIntelligenceDocumentStore;
  const loadConversation = options.getConversation ?? getUserConversation;
  const expectedMode = options.mode ?? "intelligence";

  if (options.conversationId) {
    const conversation = await loadConversation(
      options.userId,
      options.conversationId
    );

    if (!conversation) {
      return fail(404, ERROR_CODES.NOT_FOUND, "Conversation not found.");
    }

    if (conversation.mode !== expectedMode) {
      return fail(
        409,
        ERROR_CODES.CONFLICT,
        "This conversation belongs to a different Aila workspace."
      );
    }
  }

  const validated = validateIntelligenceFile(
    options.fileName,
    options.fileSize,
    options.bytes
  );

  if (!validated.ok) {
    return fail(400, validated.code, validated.message);
  }

  const extracted = await extractIntelligenceText(options.bytes, validated.kind, {
    mimeType: validated.mimeType,
    fileName: validated.fileName,
  });

  if (!extracted.ok) {
    return fail(
      extracted.code === ERROR_CODES.TIMEOUT
        ? 408
        : extracted.code === ERROR_CODES.EXTERNAL_SERVICE_ERROR
          ? 502
          : 400,
      extracted.code,
      extracted.message
    );
  }

  if (options.conversationId) {
    await store.deleteByConversation(options.conversationId);
  }

  const record = await store.create({
    userId: options.userId,
    conversationId: options.conversationId ?? null,
    fileName: validated.fileName,
    fileSize: validated.fileSize,
    mimeType: validated.mimeType,
    kind: validated.kind,
    extractedText: extracted.data.text,
    extractedCharCount: extracted.data.extractedCharCount,
    truncated: extracted.data.truncated,
  });

  return { ok: true, document: toDocumentMeta(record) };
}

export async function resolveIntelligenceDocuments(options: {
  userId: string;
  conversationId?: string;
  documentIds?: string[];
  store?: IntelligenceDocumentStore;
}): Promise<ResolvedIntelligenceDocuments> {
  const store = options.store ?? prismaIntelligenceDocumentStore;
  const requestedAll = (options.documentIds ?? []).filter(Boolean);

  if (requestedAll.length > MAX_INTELLIGENCE_ATTACHMENTS) {
    return fail(
      400,
      ERROR_CODES.VALIDATION_FAILED,
      "Only one file can be attached per request."
    );
  }

  const requested = requestedAll;

  const resolved = [];

  for (const id of requested) {
    const record = await store.findById(id);

    if (!record || !canUseDocumentInConversation(
      record,
      options.userId,
      options.conversationId
    )) {
      if (record && record.userId !== options.userId) {
        return fail(404, ERROR_CODES.NOT_FOUND, "Document not found.");
      }

      if (record && record.conversationId && record.conversationId !== options.conversationId) {
        return fail(
          409,
          ERROR_CODES.CONFLICT,
          "This file belongs to a different conversation."
        );
      }

      return fail(404, ERROR_CODES.NOT_FOUND, "Document not found.");
    }

    resolved.push(record);
  }

  if (options.conversationId && resolved.length === 0) {
    const attached = await store.findByConversation(
      options.userId,
      options.conversationId
    );
    resolved.push(...attached.slice(0, MAX_INTELLIGENCE_ATTACHMENTS));
  }

  return { ok: true, records: resolved.slice(0, MAX_INTELLIGENCE_ATTACHMENTS) };
}

export function buildIntelligenceChatContext(options: {
  records: Awaited<ReturnType<IntelligenceDocumentStore["findByConversation"]>>;
  query: string;
}): BoundedDocumentContext | null {
  const record = options.records[0];
  if (!record) {
    return null;
  }

  return buildBoundedDocumentContext({
    fileName: record.fileName,
    kind: record.kind,
    extractedText: record.extractedText,
    truncated: record.truncated,
    query: options.query,
  });
}

export { formatDocumentPromptBlock };

export async function attachIntelligenceDocuments(options: {
  userId: string;
  conversationId: string;
  documentIds: string[];
  store?: IntelligenceDocumentStore;
}): Promise<void> {
  const store = options.store ?? prismaIntelligenceDocumentStore;
  const ids = options.documentIds.slice(0, MAX_INTELLIGENCE_ATTACHMENTS);

  for (const id of ids) {
    const record = await store.findById(id);
    if (
      !record ||
      !canUseDocumentInConversation(record, options.userId, options.conversationId)
    ) {
      continue;
    }

    if (record.conversationId === options.conversationId) {
      continue;
    }

    await store.deleteByConversation(options.conversationId);
    await store.attachToConversation(id, options.conversationId);
  }
}

export async function deleteIntelligenceDocument(options: {
  userId: string;
  documentId: string;
  store?: IntelligenceDocumentStore;
}): Promise<boolean> {
  const store = options.store ?? prismaIntelligenceDocumentStore;
  return store.deleteForUser(options.userId, options.documentId);
}
