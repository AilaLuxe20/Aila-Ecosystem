import { prisma } from "@/core/database/prisma";
import { NotFoundError } from "@/lib/errors/app-error";

import { runProductChat } from "@/core/ai/product-chat";

import {
  WRITER_LIST_LIMIT,
  type CreateWriterDocumentBody,
  type ListWriterQuery,
  type UpdateWriterDocumentBody,
} from "./schema";

export type WriterDocumentDto = {
  id: string;
  title: string;
  body: string;
  folder: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

function serialize(record: {
  id: string;
  title: string;
  body: string;
  folder: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): WriterDocumentDto {
  return {
    id: record.id,
    title: record.title,
    body: record.body,
    folder: record.folder,
    status: record.status,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export async function listWriterDocuments(userId: string, query: ListWriterQuery) {
  const records = await prisma.writerDocument.findMany({
    where: {
      userId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: "insensitive" } },
              { body: { contains: query.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: query.limit ?? WRITER_LIST_LIMIT,
  });

  return records.map(serialize);
}

export async function createWriterDocument(userId: string, body: CreateWriterDocumentBody) {
  return serialize(
    await prisma.writerDocument.create({
      data: {
        userId,
        title: body.title,
        body: body.body,
        folder: body.folder ?? null,
        status: body.status,
      },
    }),
  );
}

export async function updateWriterDocument(
  userId: string,
  id: string,
  body: UpdateWriterDocumentBody,
) {
  const existing = await prisma.writerDocument.findFirst({ where: { id, userId } });
  if (!existing) throw new NotFoundError("Document");

  return serialize(
    await prisma.writerDocument.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.body !== undefined ? { body: body.body } : {}),
        ...(body.folder !== undefined ? { folder: body.folder } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
      },
    }),
  );
}

export async function deleteWriterDocument(userId: string, id: string) {
  const existing = await prisma.writerDocument.findFirst({ where: { id, userId } });
  if (!existing) throw new NotFoundError("Document");
  await prisma.writerDocument.delete({ where: { id } });
}

export function formatWriterAiContext(documents: WriterDocumentDto[]): string {
  return [
    "AILA WRITER SNAPSHOT",
    documents.length
      ? documents
          .slice(0, 12)
          .map((document) => `${document.title} (${document.status}, ${document.body.length} chars)`)
          .join("; ")
      : "No documents.",
  ].join("\n");
}

export async function rewriteWriterText(instruction: string, body: string) {
  return runProductChat(
    "writer",
    `Rewrite the following text.\nInstruction: ${instruction}\n\nText:\n${body}\n\nReturn only the rewritten text.`,
  );
}
