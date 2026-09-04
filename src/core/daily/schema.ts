import { z } from "zod";

import { isValidTimeZone } from "./timezone";

export const DAILY_NOTE_TITLE_MAX = 160;
export const DAILY_NOTE_BODY_MAX = 8_000;
export const DAILY_GOAL_TITLE_MAX = 200;
export const DAILY_ID_MAX = 64;
export const DAILY_GOAL_STATUSES = ["open", "done"] as const;

const optionalIsoDate = z
  .string()
  .trim()
  .min(1)
  .refine((value) => !Number.isNaN(new Date(value).getTime()), "Enter a valid date.")
  .optional()
  .nullable()
  .transform((value) => (value ? value : null));

export const dailyTimezoneSchema = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .refine(isValidTimeZone, "Enter a valid IANA timezone.");

export const dailyWorkspaceQuerySchema = z
  .object({
    timezone: dailyTimezoneSchema.optional().default("UTC"),
  })
  .strict();

export const dailyIdSchema = z.string().trim().min(1).max(DAILY_ID_MAX);

export const createDailyNoteSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required.").max(DAILY_NOTE_TITLE_MAX),
    body: z.string().trim().max(DAILY_NOTE_BODY_MAX).optional().default(""),
  })
  .strict();

export const updateDailyNoteSchema = z
  .object({
    title: z.string().trim().min(1).max(DAILY_NOTE_TITLE_MAX).optional(),
    body: z.string().trim().max(DAILY_NOTE_BODY_MAX).optional(),
  })
  .strict()
  .refine((value) => value.title !== undefined || value.body !== undefined, {
    message: "Provide a title or body to update.",
  });

export const createDailyGoalSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required.").max(DAILY_GOAL_TITLE_MAX),
    status: z.enum(DAILY_GOAL_STATUSES).optional().default("open"),
    dueAt: optionalIsoDate,
  })
  .strict();

export const updateDailyGoalSchema = z
  .object({
    title: z.string().trim().min(1).max(DAILY_GOAL_TITLE_MAX).optional(),
    status: z.enum(DAILY_GOAL_STATUSES).optional(),
    dueAt: optionalIsoDate,
  })
  .strict()
  .refine(
    (value) =>
      value.title !== undefined || value.status !== undefined || value.dueAt !== undefined,
    { message: "Provide a title, status, or due date to update." },
  );

export const createDailyTaskSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required.").max(DAILY_GOAL_TITLE_MAX),
    notes: z.string().trim().max(DAILY_NOTE_BODY_MAX).optional().nullable().transform((value) => (value ? value : null)),
    dueAt: optionalIsoDate,
    status: z.enum(DAILY_GOAL_STATUSES).optional().default("open"),
  })
  .strict();

export const updateDailyTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(DAILY_GOAL_TITLE_MAX).optional(),
    notes: z
      .string()
      .trim()
      .max(DAILY_NOTE_BODY_MAX)
      .optional()
      .nullable()
      .transform((value) => (value === undefined ? undefined : value ? value : null)),
    dueAt: optionalIsoDate,
    status: z.enum(DAILY_GOAL_STATUSES).optional(),
  })
  .strict()
  .refine(
    (value) =>
      value.title !== undefined ||
      value.notes !== undefined ||
      value.dueAt !== undefined ||
      value.status !== undefined,
    { message: "Provide a title, notes, due date, or status to update." },
  );

export type CreateDailyNoteBody = z.infer<typeof createDailyNoteSchema>;
export type UpdateDailyNoteBody = z.infer<typeof updateDailyNoteSchema>;
export type CreateDailyGoalBody = z.infer<typeof createDailyGoalSchema>;
export type UpdateDailyGoalBody = z.infer<typeof updateDailyGoalSchema>;
export type CreateDailyTaskBody = z.infer<typeof createDailyTaskSchema>;
export type UpdateDailyTaskBody = z.infer<typeof updateDailyTaskSchema>;
