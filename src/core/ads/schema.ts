import { z } from "zod";

export const ADS_NAME_MAX = 160;
export const ADS_LIST_LIMIT = 80;

export const ADS_OBJECTIVES = ["awareness", "traffic", "leads", "sales"] as const;
export const ADS_STATUSES = ["draft", "active", "paused", "ended"] as const;
export const ADS_PLATFORMS = ["meta", "google", "tiktok", "linkedin"] as const;
export const ADS_INTENDED_PLATFORMS = [...ADS_PLATFORMS, "other"] as const;
export const ADS_CURRENCIES = [
  "usd",
  "eur",
  "gbp",
  "ngn",
  "cad",
  "aud",
  "inr",
  "zar",
  "kes",
  "ghs",
  "jpy",
  "brl",
  "mxn",
  "aed",
  "sgd",
] as const;

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

const httpUrl = z
  .string()
  .trim()
  .max(2048)
  .optional()
  .nullable()
  .transform((value) => (value ? value : null))
  .refine(
    (value) => value === null || /^https?:\/\//i.test(value),
    "Use an http or https URL.",
  );

const campaignFields = {
  name: z.string().trim().min(1, "Name is required.").max(ADS_NAME_MAX),
  objective: z.enum(ADS_OBJECTIVES),
  budgetCents: z.number().int().min(100).max(100_000_000),
  plannedSpendCents: z.number().int().min(0).max(100_000_000).optional().nullable(),
  headline: z.string().trim().max(90).optional().default(""),
  body: z.string().trim().max(2000).optional().default(""),
  targetingNotes: optionalText(5000),
  audience: optionalText(5000),
  location: optionalText(500),
  landingPageUrl: httpUrl,
  conversionGoal: optionalText(200),
  callToAction: optionalText(80),
  currency: z.enum(ADS_CURRENCIES).optional().default("usd"),
  timezone: z
    .string()
    .trim()
    .min(1)
    .max(64)
    .regex(/^[A-Za-z0-9_+\-/]+$/, "Enter a valid timezone.")
    .optional()
    .default("UTC"),
  intendedPlatform: z.enum(ADS_INTENDED_PLATFORMS).optional().nullable(),
  startsAt: isoDate.optional().nullable(),
  endsAt: isoDate.optional().nullable(),
};

export const createAdsCampaignSchema = z.object(campaignFields).strict();

export const updateAdsCampaignSchema = z
  .object({
    name: campaignFields.name.optional(),
    objective: campaignFields.objective.optional(),
    budgetCents: campaignFields.budgetCents.optional(),
    plannedSpendCents: campaignFields.plannedSpendCents,
    headline: z.string().trim().max(90).optional(),
    body: z.string().trim().max(2000).optional(),
    targetingNotes: optionalText(5000),
    audience: optionalText(5000),
    location: optionalText(500),
    landingPageUrl: httpUrl,
    conversionGoal: optionalText(200),
    callToAction: optionalText(80),
    currency: z.enum(ADS_CURRENCIES).optional(),
    timezone: z
      .string()
      .trim()
      .min(1)
      .max(64)
      .regex(/^[A-Za-z0-9_+\-/]+$/, "Enter a valid timezone.")
      .optional(),
    intendedPlatform: z.enum(ADS_INTENDED_PLATFORMS).optional().nullable(),
    startsAt: isoDate.optional().nullable(),
    endsAt: isoDate.optional().nullable(),
    status: z.enum(ADS_STATUSES).optional(),
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
    status: z.enum(ADS_STATUSES).optional(),
    limit: z.coerce.number().int().min(1).max(ADS_LIST_LIMIT).optional(),
  })
  .strict();

export const adsIdSchema = z.string().trim().min(1).max(64);

export const createAdsCreativeSchema = z
  .object({
    headline: z.string().trim().min(1).max(90),
    body: z.string().trim().min(1).max(2000),
    callToAction: optionalText(80),
    variantLabel: optionalText(80),
  })
  .strict();

export const generateAdsSchema = z
  .object({
    campaignId: adsIdSchema,
    count: z.number().int().min(1).max(5).optional().default(3),
  })
  .strict();

export const audienceAssistSchema = z
  .object({
    campaignId: adsIdSchema,
    brief: z.string().trim().max(4000).optional(),
    apply: z.boolean().optional().default(false),
  })
  .strict();

export const analyzeCampaignSchema = z
  .object({
    campaignId: adsIdSchema,
  })
  .strict();

export const analyzeLandingPageSchema = z
  .object({
    campaignId: adsIdSchema.optional(),
    url: z.string().trim().min(1).max(2048),
  })
  .strict();

export type CreateAdsCampaignBody = z.infer<typeof createAdsCampaignSchema>;
export type UpdateAdsCampaignBody = z.infer<typeof updateAdsCampaignSchema>;
export type ListAdsQuery = z.infer<typeof listAdsQuerySchema>;
export type CreateAdsCreativeBody = z.infer<typeof createAdsCreativeSchema>;
export type GenerateAdsBody = z.infer<typeof generateAdsSchema>;
export type AudienceAssistBody = z.infer<typeof audienceAssistSchema>;
export type AnalyzeLandingPageBody = z.infer<typeof analyzeLandingPageSchema>;
