import { z } from "zod";

export const WRITER_LIST_LIMIT = 80;

export const createWriterDocumentSchema = z
  .object({
    title: z.string().trim().min(1).max(160),
    body: z.string().max(80_000).default(""),
    folder: z.string().trim().max(80).optional().nullable(),
    status: z.enum(["draft", "final"]).optional().default("draft"),
  })
  .strict();

export const updateWriterDocumentSchema = z
  .object({
    title: z.string().trim().min(1).max(160).optional(),
    body: z.string().max(80_000).optional(),
    folder: z.string().trim().max(80).optional().nullable(),
    status: z.enum(["draft", "final"]).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({ code: "custom", message: "At least one field is required." });
    }
  });

export const rewriteWriterDocumentSchema = z
  .object({
    instruction: z.string().trim().min(1).max(500),
    body: z.string().trim().min(1).max(80_000),
  })
  .strict();

export const listWriterQuerySchema = z
  .object({
    q: z.string().trim().max(120).optional(),
    status: z.enum(["draft", "final"]).optional(),
    limit: z.coerce.number().int().min(1).max(WRITER_LIST_LIMIT).optional(),
  })
  .strict();

export const writerIdSchema = z.string().trim().min(1).max(64);

export const WRITER_BOOK_STATUSES = ["idea", "drafting", "revising", "complete"] as const;
export const WRITER_CHAPTER_STATUSES = ["planned", "drafting", "revised", "final"] as const;

export const WRITER_GENERATE_ACTIONS = [
  "develop_concept",
  "develop_world",
  "develop_bible",
  "develop_plot",
  "develop_outline",
  "develop_character",
  "plan_chapter",
  "generate_scene",
  "rewrite",
  "expand",
  "shorten",
  "change_tone",
  "improve_dialogue",
  "improve_pacing",
  "improve_description",
  "grammar",
  "continuity",
] as const;

export type WriterGenerateAction = (typeof WRITER_GENERATE_ACTIONS)[number];

const optionalText = (max: number) => z.string().max(max).optional();

export const createWriterBookSchema = z
  .object({
    title: z.string().trim().min(1).max(160),
    premise: z.string().max(20_000).optional().default(""),
    genre: z.string().trim().max(80).optional().default(""),
  })
  .strict();

export const updateWriterBookSchema = z
  .object({
    title: z.string().trim().min(1).max(160).optional(),
    premise: optionalText(20_000),
    genre: z.string().trim().max(80).optional(),
    themes: optionalText(8_000),
    audience: z.string().trim().max(160).optional(),
    tone: z.string().trim().max(160).optional(),
    worldBible: optionalText(40_000),
    storyBible: optionalText(40_000),
    plot: optionalText(40_000),
    outline: optionalText(40_000),
    locations: optionalText(20_000),
    timeline: optionalText(20_000),
    continuityNotes: optionalText(20_000),
    status: z.enum(WRITER_BOOK_STATUSES).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({ code: "custom", message: "At least one field is required." });
    }
  });

export const createWriterCharacterSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    role: z.string().trim().max(120).optional().default(""),
    bio: z.string().max(20_000).optional().default(""),
  })
  .strict();

export const updateWriterCharacterSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    role: z.string().trim().max(120).optional(),
    bio: optionalText(20_000),
    appearance: optionalText(8_000),
    motivation: optionalText(8_000),
    relationships: optionalText(8_000),
    notes: optionalText(8_000),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({ code: "custom", message: "At least one field is required." });
    }
  });

export const createWriterChapterSchema = z
  .object({
    title: z.string().trim().min(1).max(160),
    summary: z.string().max(8_000).optional().default(""),
  })
  .strict();

export const updateWriterChapterSchema = z
  .object({
    title: z.string().trim().min(1).max(160).optional(),
    summary: optionalText(8_000),
    scenePlan: optionalText(12_000),
    body: optionalText(120_000),
    status: z.enum(WRITER_CHAPTER_STATUSES).optional(),
    position: z.number().int().min(1).max(500).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({ code: "custom", message: "At least one field is required." });
    }
  });

export const generateWriterSchema = z
  .object({
    action: z.enum(WRITER_GENERATE_ACTIONS),
    bookId: z.string().trim().min(1).max(64),
    chapterId: z.string().trim().min(1).max(64).optional(),
    characterId: z.string().trim().min(1).max(64).optional(),
    instruction: z.string().trim().max(1_000).optional(),
  })
  .strict();

export type CreateWriterDocumentBody = z.infer<typeof createWriterDocumentSchema>;
export type UpdateWriterDocumentBody = z.infer<typeof updateWriterDocumentSchema>;
export type ListWriterQuery = z.infer<typeof listWriterQuerySchema>;
export type CreateWriterBookBody = z.infer<typeof createWriterBookSchema>;
export type UpdateWriterBookBody = z.infer<typeof updateWriterBookSchema>;
export type CreateWriterCharacterBody = z.infer<typeof createWriterCharacterSchema>;
export type UpdateWriterCharacterBody = z.infer<typeof updateWriterCharacterSchema>;
export type CreateWriterChapterBody = z.infer<typeof createWriterChapterSchema>;
export type UpdateWriterChapterBody = z.infer<typeof updateWriterChapterSchema>;
export type GenerateWriterBody = z.infer<typeof generateWriterSchema>;
