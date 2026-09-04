import { randomUUID } from "node:crypto";

import { prisma } from "@/core/database/prisma";

import { isIntelligenceFileKind } from "./kinds";
import type { IntelligenceDocumentRecord } from "./ownership";

export type IntelligenceDocumentCreate = Omit<
  IntelligenceDocumentRecord,
  "id" | "createdAt" | "updatedAt"
> & {
  id?: string;
};

export interface IntelligenceDocumentStore {
  create(data: IntelligenceDocumentCreate): Promise<IntelligenceDocumentRecord>;
  findById(id: string): Promise<IntelligenceDocumentRecord | null>;
  findByConversation(
    userId: string,
    conversationId: string
  ): Promise<IntelligenceDocumentRecord[]>;
  attachToConversation(
    id: string,
    conversationId: string
  ): Promise<void>;
  deleteByConversation(conversationId: string): Promise<void>;
  deleteForUser(userId: string, id: string): Promise<boolean>;
}

function mapPrismaRecord(record: {
  id: string;
  userId: string;
  conversationId: string | null;
  fileName: string;
  fileSize: number;
  mimeType: string;
  kind: string;
  extractedText: string;
  extractedCharCount: number;
  truncated: boolean;
  createdAt: Date;
  updatedAt: Date;
}): IntelligenceDocumentRecord | null {
  if (!isIntelligenceFileKind(record.kind)) {
    return null;
  }

  return {
    ...record,
    kind: record.kind,
  };
}

export const prismaIntelligenceDocumentStore: IntelligenceDocumentStore = {
  async create(data) {
    const created = await prisma.intelligenceDocument.create({
      data: {
        userId: data.userId,
        conversationId: data.conversationId,
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        kind: data.kind,
        extractedText: data.extractedText,
        extractedCharCount: data.extractedCharCount,
        truncated: data.truncated,
      },
    });

    const mapped = mapPrismaRecord(created);
    if (!mapped) {
      throw new Error("Stored document kind was invalid.");
    }

    return mapped;
  },

  async findById(id) {
    const record = await prisma.intelligenceDocument.findUnique({
      where: { id },
    });

    return record ? mapPrismaRecord(record) : null;
  },

  async findByConversation(userId, conversationId) {
    const records = await prisma.intelligenceDocument.findMany({
      where: { userId, conversationId },
      orderBy: { createdAt: "asc" },
    });

    return records
      .map(mapPrismaRecord)
      .filter((record): record is IntelligenceDocumentRecord => record !== null);
  },

  async attachToConversation(id, conversationId) {
    await prisma.intelligenceDocument.update({
      where: { id },
      data: { conversationId },
    });
  },

  async deleteByConversation(conversationId) {
    await prisma.intelligenceDocument.deleteMany({
      where: { conversationId },
    });
  },

  async deleteForUser(userId, id) {
    const result = await prisma.intelligenceDocument.deleteMany({
      where: { id, userId },
    });

    return result.count > 0;
  },
};

export function createMemoryIntelligenceDocumentStore(): IntelligenceDocumentStore {
  const records = new Map<string, IntelligenceDocumentRecord>();

  return {
    async create(data) {
      const now = new Date();
      const record: IntelligenceDocumentRecord = {
        id: data.id ?? randomUUID(),
        userId: data.userId,
        conversationId: data.conversationId,
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        kind: data.kind,
        extractedText: data.extractedText,
        extractedCharCount: data.extractedCharCount,
        truncated: data.truncated,
        createdAt: now,
        updatedAt: now,
      };
      records.set(record.id, record);
      return record;
    },

    async findById(id) {
      return records.get(id) ?? null;
    },

    async findByConversation(userId, conversationId) {
      return [...records.values()].filter(
        (record) =>
          record.userId === userId && record.conversationId === conversationId
      );
    },

    async attachToConversation(id, conversationId) {
      const record = records.get(id);
      if (!record) {
        return;
      }
      records.set(id, { ...record, conversationId, updatedAt: new Date() });
    },

    async deleteByConversation(conversationId) {
      for (const [id, record] of records) {
        if (record.conversationId === conversationId) {
          records.delete(id);
        }
      }
    },

    async deleteForUser(userId, id) {
      const record = records.get(id);
      if (!record || record.userId !== userId) {
        return false;
      }
      records.delete(id);
      return true;
    },
  };
}
