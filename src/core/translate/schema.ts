import { z } from "zod";

export const TRANSLATE_LIST_LIMIT = 80;
export const TRANSLATE_TEXT_MAX = 20_000;
export const TRANSLATE_LANG_MIN = 2;
export const TRANSLATE_LANG_MAX = 32;

const languageSchema = z.string().trim().min(TRANSLATE_LANG_MIN).max(TRANSLATE_LANG_MAX);

export const createTranslateSchema = z
  .object({
    sourceLang: languageSchema,
    targetLang: languageSchema,
    sourceText: z.string().trim().min(1).max(TRANSLATE_TEXT_MAX),
  })
  .strict();

export const listTranslateQuerySchema = z
  .object({
    q: z.string().trim().max(120).optional(),
    limit: z.coerce.number().int().min(1).max(TRANSLATE_LIST_LIMIT).optional(),
  })
  .strict();

export const translateIdSchema = z.string().trim().min(1).max(64);

export type CreateTranslateBody = z.infer<typeof createTranslateSchema>;
export type ListTranslateQuery = z.infer<typeof listTranslateQuerySchema>;
