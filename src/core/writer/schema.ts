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

export type CreateWriterDocumentBody = z.infer<typeof createWriterDocumentSchema>;
export type UpdateWriterDocumentBody = z.infer<typeof updateWriterDocumentSchema>;
export type ListWriterQuery = z.infer<typeof listWriterQuerySchema>;
