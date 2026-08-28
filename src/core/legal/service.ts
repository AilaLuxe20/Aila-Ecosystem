import { prisma } from "@/core/database/prisma";
import { MAX_DOCUMENT_SIZE } from "@/core/constants";

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
