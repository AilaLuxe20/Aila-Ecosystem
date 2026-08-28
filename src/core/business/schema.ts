import { z } from "zod";

export const BUSINESS_NAME_MAX = 120;
export const BUSINESS_EMAIL_MAX = 200;
export const BUSINESS_COMPANY_MAX = 150;
export const BUSINESS_PHONE_MAX = 40;
export const BUSINESS_NOTES_MAX = 5000;
export const BUSINESS_TITLE_MAX = 160;
export const BUSINESS_LIST_LIMIT = 100;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => (value ? value : null));

export const businessContactStatusSchema = z.enum(["lead", "active", "archived"]);
export const businessTaskStatusSchema = z.enum(["open", "done"]);

export const createBusinessContactSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required.").max(BUSINESS_NAME_MAX),
    email: z
      .string()
      .trim()
      .email("Enter a valid email.")
      .max(BUSINESS_EMAIL_MAX)
      .optional()
      .nullable()
      .transform((value) => (value ? value.toLowerCase() : null)),
    company: optionalText(BUSINESS_COMPANY_MAX),
    phone: optionalText(BUSINESS_PHONE_MAX),
    notes: optionalText(BUSINESS_NOTES_MAX),
    status: businessContactStatusSchema.optional().default("lead"),
  })
  .strict();

export const updateBusinessContactSchema = createBusinessContactSchema
  .partial()
  .strict()
  .superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({ code: "custom", message: "At least one field is required." });
    }
  });

export const createBusinessTaskSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required.").max(BUSINESS_TITLE_MAX),
    notes: optionalText(BUSINESS_NOTES_MAX),
    contactId: z.string().trim().min(1).max(64).optional().nullable(),
    dueAt: z
      .string()
      .trim()
      .min(1)
      .refine((value) => !Number.isNaN(new Date(value).getTime()), "Enter a valid due date.")
      .optional()
      .nullable(),
    status: businessTaskStatusSchema.optional().default("open"),
  })
  .strict();

export const updateBusinessTaskSchema = createBusinessTaskSchema
  .partial()
  .strict()
  .superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({ code: "custom", message: "At least one field is required." });
    }
  });

export const listBusinessQuerySchema = z
  .object({
    q: z.string().trim().max(120).optional(),
    status: z.string().trim().optional(),
    limit: z.coerce.number().int().min(1).max(BUSINESS_LIST_LIMIT).optional(),
  })
  .strict();

export const businessIdSchema = z.string().trim().min(1).max(64);

export type CreateBusinessContactBody = z.infer<typeof createBusinessContactSchema>;
export type UpdateBusinessContactBody = z.infer<typeof updateBusinessContactSchema>;
export type CreateBusinessTaskBody = z.infer<typeof createBusinessTaskSchema>;
export type UpdateBusinessTaskBody = z.infer<typeof updateBusinessTaskSchema>;
export type ListBusinessQuery = z.infer<typeof listBusinessQuerySchema>;
