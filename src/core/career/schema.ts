import { z } from "zod";

export const CAREER_LIST_LIMIT = 80;
export const CAREER_TITLE_MAX = 160;
export const CAREER_TEXT_MAX = 20_000;
export const CAREER_NOTES_MAX = 8_000;

export const CAREER_RESUME_STATUSES = ["draft", "ready"] as const;
export const CAREER_APPLICATION_STATUSES = [
  "draft",
  "applied",
  "interview",
  "offer",
  "rejected",
] as const;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => (value ? value : null));

const optionalIsoDate = z
  .string()
  .trim()
  .min(1)
  .refine((value) => !Number.isNaN(new Date(value).getTime()), "Enter a valid date.")
  .optional()
  .nullable()
  .transform((value) => (value ? value : null));

export const createCareerResumeSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required.").max(CAREER_TITLE_MAX),
    summary: z.string().max(CAREER_TEXT_MAX).optional().default(""),
    experience: z.string().max(CAREER_TEXT_MAX).optional().default(""),
    skills: z.string().max(CAREER_TEXT_MAX).optional().default(""),
    status: z.enum(CAREER_RESUME_STATUSES).optional().default("draft"),
  })
  .strict();

export const updateCareerResumeSchema = z
  .object({
    title: z.string().trim().min(1).max(CAREER_TITLE_MAX).optional(),
    summary: z.string().max(CAREER_TEXT_MAX).optional(),
    experience: z.string().max(CAREER_TEXT_MAX).optional(),
    skills: z.string().max(CAREER_TEXT_MAX).optional(),
    status: z.enum(CAREER_RESUME_STATUSES).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({ code: "custom", message: "At least one field is required." });
    }
  });

export const createCareerApplicationSchema = z
  .object({
    company: z.string().trim().min(1, "Company is required.").max(CAREER_TITLE_MAX),
    role: z.string().trim().min(1, "Role is required.").max(CAREER_TITLE_MAX),
    status: z.enum(CAREER_APPLICATION_STATUSES).optional().default("draft"),
    notes: optionalText(CAREER_NOTES_MAX),
    appliedAt: optionalIsoDate,
    interviewAt: optionalIsoDate,
  })
  .strict();

export const updateCareerApplicationSchema = z
  .object({
    company: z.string().trim().min(1).max(CAREER_TITLE_MAX).optional(),
    role: z.string().trim().min(1).max(CAREER_TITLE_MAX).optional(),
    status: z.enum(CAREER_APPLICATION_STATUSES).optional(),
    notes: z
      .string()
      .trim()
      .max(CAREER_NOTES_MAX)
      .optional()
      .nullable()
      .transform((value) => (value === undefined ? undefined : value ? value : null)),
    appliedAt: optionalIsoDate,
    interviewAt: optionalIsoDate,
  })
  .strict()
  .superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({ code: "custom", message: "At least one field is required." });
    }
  });

export const listCareerQuerySchema = z
  .object({
    q: z.string().trim().max(120).optional(),
    status: z.string().trim().max(40).optional(),
    limit: z.coerce.number().int().min(1).max(CAREER_LIST_LIMIT).optional(),
  })
  .strict();

export const careerIdSchema = z.string().trim().min(1).max(64);

export type CreateCareerResumeBody = z.infer<typeof createCareerResumeSchema>;
export type UpdateCareerResumeBody = z.infer<typeof updateCareerResumeSchema>;
export type CreateCareerApplicationBody = z.infer<typeof createCareerApplicationSchema>;
export type UpdateCareerApplicationBody = z.infer<typeof updateCareerApplicationSchema>;
export type ListCareerQuery = z.infer<typeof listCareerQuerySchema>;
