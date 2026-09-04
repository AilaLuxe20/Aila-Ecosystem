import { prisma } from "@/core/database/prisma";
import { NotFoundError } from "@/lib/errors/app-error";

import { runProductChat } from "@/core/ai/product-chat";

import {
  TRANSLATE_LIST_LIMIT,
  type CreateTranslateBody,
  type ListTranslateQuery,
} from "./schema";

export type TranslateEntryDto = {
  id: string;
  sourceLang: string;
  targetLang: string;
  sourceText: string;
  translatedText: string;
  createdAt: string;
  updatedAt: string;
};

function serialize(record: {
  id: string;
  sourceLang: string;
  targetLang: string;
  sourceText: string;
  translatedText: string;
  createdAt: Date;
  updatedAt: Date;
}): TranslateEntryDto {
  return {
    id: record.id,
    sourceLang: record.sourceLang,
    targetLang: record.targetLang,
    sourceText: record.sourceText,
    translatedText: record.translatedText,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export async function listTranslateEntries(userId: string, query: ListTranslateQuery) {
  const records = await prisma.translateEntry.findMany({
    where: {
      userId,
      ...(query.q
        ? {
            OR: [
              { sourceText: { contains: query.q, mode: "insensitive" } },
              { translatedText: { contains: query.q, mode: "insensitive" } },
              { sourceLang: { contains: query.q, mode: "insensitive" } },
              { targetLang: { contains: query.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: query.limit ?? TRANSLATE_LIST_LIMIT,
  });

  return records.map(serialize);
}

export async function createTranslateEntry(userId: string, body: CreateTranslateBody) {
  const translatedText = await runProductChat(
    "translate",
    `Translate the following text from ${body.sourceLang} to ${body.targetLang}. Return ONLY the translation. Do not add commentary, labels, quotation marks, or notes.\n\nText:\n${body.sourceText}`,
  );

  return serialize(
    await prisma.translateEntry.create({
      data: {
        userId,
        sourceLang: body.sourceLang,
        targetLang: body.targetLang,
        sourceText: body.sourceText,
        translatedText,
      },
    }),
  );
}

export function formatTranslateAiContext(entries: TranslateEntryDto[]): string {
  return [
    "AILA TRANSLATE SNAPSHOT",
    entries.length
      ? entries
          .slice(0, 12)
          .map((entry) => `${entry.sourceLang} → ${entry.targetLang}: ${entry.sourceText.slice(0, 80)}`)
          .join("; ")
      : "No translations.",
  ].join("\n");
}

export async function deleteTranslateEntry(userId: string, id: string) {
  const existing = await prisma.translateEntry.findFirst({ where: { id, userId } });
  if (!existing) throw new NotFoundError("Translation");
  await prisma.translateEntry.delete({ where: { id } });
}
