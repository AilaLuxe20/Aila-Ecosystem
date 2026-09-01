import { z } from "zod";

export const CODING_LIST_LIMIT = 80;
export const CODING_NAME_MAX = 160;
export const CODING_DESCRIPTION_MAX = 2_000;
export const CODING_FILE_PATH_MAX = 240;
export const CODING_FILE_CONTENT_MAX = 200_000;

export const CODING_LANGUAGES = [
  "typescript",
  "javascript",
  "python",
  "go",
  "rust",
  "java",
  "csharp",
  "html",
  "css",
  "json",
  "markdown",
  "sql",
  "other",
] as const;

export const codingLanguageSchema = z.enum(CODING_LANGUAGES);

export const codingFileSchema = z
  .object({
    id: z.string().trim().min(1).max(64).optional(),
    path: z.string().trim().min(1).max(CODING_FILE_PATH_MAX),
    language: codingLanguageSchema,
    content: z.string().max(CODING_FILE_CONTENT_MAX).default(""),
  })
  .strict();

export const createCodingProjectSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required.").max(CODING_NAME_MAX),
    language: codingLanguageSchema,
    description: z
      .string()
      .trim()
      .max(CODING_DESCRIPTION_MAX)
      .optional()
      .nullable()
      .transform((value) => (value ? value : null)),
  })
  .strict();

export const updateCodingProjectSchema = z
  .object({
    name: z.string().trim().min(1).max(CODING_NAME_MAX).optional(),
    language: codingLanguageSchema.optional(),
    description: z
      .string()
      .trim()
      .max(CODING_DESCRIPTION_MAX)
      .optional()
      .nullable()
      .transform((value) => (value === undefined ? undefined : value ? value : null)),
    files: z.array(codingFileSchema).min(1).max(40).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({ code: "custom", message: "At least one field is required." });
    }
  });

export const explainCodingFileSchema = z
  .object({
    fileId: z.string().trim().min(1).max(64),
  })
  .strict();

export const listCodingQuerySchema = z
  .object({
    q: z.string().trim().max(120).optional(),
    language: codingLanguageSchema.optional(),
    limit: z.coerce.number().int().min(1).max(CODING_LIST_LIMIT).optional(),
  })
  .strict();

export const codingIdSchema = z.string().trim().min(1).max(64);

export type CreateCodingProjectBody = z.infer<typeof createCodingProjectSchema>;
export type UpdateCodingProjectBody = z.infer<typeof updateCodingProjectSchema>;
export type ExplainCodingFileBody = z.infer<typeof explainCodingFileSchema>;
export type ListCodingQuery = z.infer<typeof listCodingQuerySchema>;
export type CodingFileInput = z.infer<typeof codingFileSchema>;
