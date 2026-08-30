import { z } from "zod";

export const EDUCATION_LIST_LIMIT = 80;
export const EDUCATION_TITLE_MAX = 160;
export const EDUCATION_TOPIC_MAX = 160;
export const EDUCATION_DESCRIPTION_MAX = 5_000;
export const EDUCATION_NOTE_BODY_MAX = 40_000;
export const EDUCATION_QUIZ_TEXT_MAX = 8_000;

export const EDUCATION_COURSE_STATUSES = ["active", "completed"] as const;

const optionalCourseId = z
  .string()
  .trim()
  .max(64)
  .optional()
  .nullable()
  .transform((value) => (value ? value : null));

export const createEducationCourseSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required.").max(EDUCATION_TITLE_MAX),
    topic: z.string().trim().min(1, "Topic is required.").max(EDUCATION_TOPIC_MAX),
    description: z
      .string()
      .trim()
      .max(EDUCATION_DESCRIPTION_MAX)
      .optional()
      .nullable()
      .transform((value) => (value ? value : null)),
    status: z.enum(EDUCATION_COURSE_STATUSES).optional().default("active"),
  })
  .strict();

export const updateEducationCourseSchema = z
  .object({
    title: z.string().trim().min(1).max(EDUCATION_TITLE_MAX).optional(),
    topic: z.string().trim().min(1).max(EDUCATION_TOPIC_MAX).optional(),
    description: z
      .string()
      .trim()
      .max(EDUCATION_DESCRIPTION_MAX)
      .optional()
      .nullable()
      .transform((value) => (value === undefined ? undefined : value ? value : null)),
    status: z.enum(EDUCATION_COURSE_STATUSES).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({ code: "custom", message: "At least one field is required." });
    }
  });

export const createEducationNoteSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required.").max(EDUCATION_TITLE_MAX),
    body: z.string().max(EDUCATION_NOTE_BODY_MAX).optional().default(""),
    courseId: optionalCourseId,
  })
  .strict();

export const updateEducationNoteSchema = z
  .object({
    title: z.string().trim().min(1).max(EDUCATION_TITLE_MAX).optional(),
    body: z.string().max(EDUCATION_NOTE_BODY_MAX).optional(),
    courseId: optionalCourseId,
  })
  .strict()
  .superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({ code: "custom", message: "At least one field is required." });
    }
  });

export const createEducationQuizSchema = z
  .object({
    courseId: z.string().trim().min(1).max(64),
    question: z.string().trim().min(1, "Question is required.").max(EDUCATION_QUIZ_TEXT_MAX),
    answer: z.string().trim().min(1, "Answer is required.").max(EDUCATION_QUIZ_TEXT_MAX),
  })
  .strict();

export const updateEducationQuizSchema = z
  .object({
    question: z.string().trim().min(1).max(EDUCATION_QUIZ_TEXT_MAX).optional(),
    answer: z.string().trim().min(1).max(EDUCATION_QUIZ_TEXT_MAX).optional(),
    userAnswer: z.string().max(EDUCATION_QUIZ_TEXT_MAX).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({ code: "custom", message: "At least one field is required." });
    }
  });

export const listEducationQuerySchema = z
  .object({
    q: z.string().trim().max(120).optional(),
    status: z.enum(EDUCATION_COURSE_STATUSES).optional(),
    courseId: z.string().trim().min(1).max(64).optional(),
    limit: z.coerce.number().int().min(1).max(EDUCATION_LIST_LIMIT).optional(),
  })
  .strict();

export const educationIdSchema = z.string().trim().min(1).max(64);

export type CreateEducationCourseBody = z.infer<typeof createEducationCourseSchema>;
export type UpdateEducationCourseBody = z.infer<typeof updateEducationCourseSchema>;
export type CreateEducationNoteBody = z.infer<typeof createEducationNoteSchema>;
export type UpdateEducationNoteBody = z.infer<typeof updateEducationNoteSchema>;
export type CreateEducationQuizBody = z.infer<typeof createEducationQuizSchema>;
export type UpdateEducationQuizBody = z.infer<typeof updateEducationQuizSchema>;
export type ListEducationQuery = z.infer<typeof listEducationQuerySchema>;
