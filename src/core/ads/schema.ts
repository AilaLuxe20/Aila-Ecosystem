import { z } from "zod";

export const ADS_NAME_MAX = 160;
export const ADS_LIST_LIMIT = 80;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => (value ? value : null));

const isoDate = z
  .string()
  .trim()
  .min(1)
  .refine((value) => !Number.isNaN(new Date(value).getTime()), "Enter a valid date.");

export const createAdsCampaignSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required.").max(ADS_NAME_MAX),
    objective: z.enum(["awareness", "traffic", "leads", "sales"]),
    budgetCents: z.number().int().min(100).max(100_000_000),
    headline: z.string().trim().min(1).max(90),
    body: z.string().trim().min(1).max(2000),
    targetingNotes: optionalText(5000),
    startsAt: isoDate.optional().nullable(),
    endsAt: isoDate.optional().nullable(),
  })
  .strict();

export const updateAdsCampaignSchema = z
  .object({
    name: z.string().trim().min(1).max(ADS_NAME_MAX).optional(),
    objective: z.enum(["awareness", "traffic", "leads", "sales"]).optional(),
    budgetCents: z.number().int().min(100).max(100_000_000).optional(),
    headline: z.string().trim().min(1).max(90).optional(),
    body: z.string().trim().min(1).max(2000).optional(),
    targetingNotes: optionalText(5000),
    startsAt: isoDate.optional().nullable(),
    endsAt: isoDate.optional().nullable(),
    status: z.enum(["draft", "active", "paused", "ended"]).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({ code: "custom", message: "At least one field is required." });
    }
  });

export const listAdsQuerySchema = z
  .object({
    q: z.string().trim().max(120).optional(),
    status: z.enum(["draft", "active", "paused", "ended"]).optional(),
    limit: z.coerce.number().int().min(1).max(ADS_LIST_LIMIT).optional(),
  })
  .strict();

export const adsIdSchema = z.string().trim().min(1).max(64);

export type CreateAdsCampaignBody = z.infer<typeof createAdsCampaignSchema>;
export type UpdateAdsCampaignBody = z.infer<typeof updateAdsCampaignSchema>;
export type ListAdsQuery = z.infer<typeof listAdsQuerySchema>;
