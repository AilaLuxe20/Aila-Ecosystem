import { prisma } from "@/core/database/prisma";
import { MAX_DOCUMENT_SIZE } from "@/core/constants";
import { NotFoundError } from "@/lib/errors/app-error";

export type LegalDocumentListItem = {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  hasSummary: boolean;
};

export type LegalDocumentDto = LegalDocumentListItem & {
  content: string;
  summary: string | null;
};

export async function listLegalDocuments(userId: string): Promise<LegalDocumentListItem[]> {
  const records = await prisma.legalDocument.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      fileName: true,
      fileSize: true,
      mimeType: true,
      summary: true,
      createdAt: true,
    },
  });

  return records.map((record) => ({
    id: record.id,
    fileName: record.fileName,
    fileSize: record.fileSize,
    mimeType: record.mimeType,
    createdAt: record.createdAt.toISOString(),
    hasSummary: Boolean(record.summary),
  }));
}

export async function getLegalDocument(userId: string, id: string): Promise<LegalDocumentDto> {
  const record = await prisma.legalDocument.findFirst({
    where: { id, userId },
  });

  if (!record) {
    throw new NotFoundError("Document");
  }

  return {
    id: record.id,
    fileName: record.fileName,
    fileSize: record.fileSize,
    mimeType: record.mimeType,
    createdAt: record.createdAt.toISOString(),
    hasSummary: Boolean(record.summary),
    content: record.content,
    summary: record.summary,
  };
}

export async function deleteLegalDocument(userId: string, id: string) {
  const existing = await prisma.legalDocument.findFirst({ where: { id, userId } });
  if (!existing) {
    throw new NotFoundError("Document");
  }
  await prisma.legalDocument.delete({ where: { id } });
}

export async function getLatestLegalDocumentContext(
  userId: string,
): Promise<{ fileName: string; text: string } | null> {
  const record = await prisma.legalDocument.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      fileName: true,
      content: true,
    },
  });

  if (!record) {
    return null;
  }

  const text = record.content.trim().slice(0, 14000);
  if (!text) {
    return null;
  }

  return {
    fileName: record.fileName,
    text,
  };
}

export async function saveLegalDocument(input: {
  userId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileType: string;
  content: string;
  summary: string | null;
}) {
  return prisma.legalDocument.create({
    data: {
      userId: input.userId,
      fileName: input.fileName.slice(0, 255),
      fileSize: Math.min(input.fileSize, MAX_DOCUMENT_SIZE),
      mimeType: input.mimeType.slice(0, 255),
      fileType: input.fileType.slice(0, 32),
      content: input.content,
      summary: input.summary,
    },
    select: {
      id: true,
      fileName: true,
      fileSize: true,
      mimeType: true,
      createdAt: true,
    },
  });
}
