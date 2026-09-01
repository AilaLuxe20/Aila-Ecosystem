import { z } from "zod";

export const HEALTH_LIST_LIMIT = 80;
export const HEALTH_ID_MAX = 64;

export const HEALTH_HABIT_CADENCES = ["daily", "weekly"] as const;
export const HEALTH_LOG_KINDS = ["note", "mood", "sleep", "activity", "reminder"] as const;

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

export const healthIdSchema = z.string().trim().min(1).max(HEALTH_ID_MAX);

export const listHealthQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(HEALTH_LIST_LIMIT).optional(),
  })
  .strict();

export const createHealthHabitSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required.").max(160),
    cadence: z.enum(HEALTH_HABIT_CADENCES),
    notes: optionalText(4_000),
  })
  .strict();

export const updateHealthHabitSchema = z
  .object({
    name: z.string().trim().min(1).max(160).optional(),
    cadence: z.enum(HEALTH_HABIT_CADENCES).optional(),
    notes: z.string().trim().max(4_000).optional().nullable(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.name === undefined && value.cadence === undefined && value.notes === undefined) {
      ctx.addIssue({ code: "custom", message: "At least one field is required." });
    }
  });

export const createHealthLogSchema = z
  .object({
    kind: z.enum(HEALTH_LOG_KINDS),
    title: z.string().trim().min(1, "Title is required.").max(160),
    body: z.string().trim().max(8_000).optional().default(""),
    remindAt: optionalIsoDate,
    done: z.boolean().optional().default(false),
  })
  .strict();

export const updateHealthLogSchema = z
  .object({
    kind: z.enum(HEALTH_LOG_KINDS).optional(),
    title: z.string().trim().min(1).max(160).optional(),
    body: z.string().trim().max(8_000).optional(),
    remindAt: z
      .string()
      .trim()
      .min(1)
      .refine((value) => !Number.isNaN(new Date(value).getTime()), "Enter a valid date.")
      .optional()
      .nullable(),
    done: z.boolean().optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (
      value.kind === undefined &&
      value.title === undefined &&
      value.body === undefined &&
      value.remindAt === undefined &&
      value.done === undefined
    ) {
      ctx.addIssue({ code: "custom", message: "At least one field is required." });
    }
  });

export type CreateHealthHabitBody = z.infer<typeof createHealthHabitSchema>;
export type UpdateHealthHabitBody = z.infer<typeof updateHealthHabitSchema>;
export type CreateHealthLogBody = z.infer<typeof createHealthLogSchema>;
export type UpdateHealthLogBody = z.infer<typeof updateHealthLogSchema>;
export type ListHealthQuery = z.infer<typeof listHealthQuerySchema>;
