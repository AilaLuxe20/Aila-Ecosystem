import { z } from "zod";

import { slugSchema } from "@/core/apps/schema";

export const SITE_NAME_MAX = 120;
export const SITE_LIST_LIMIT = 40;

export const sitePageSchema = z
  .object({
    id: z.string().trim().min(1).max(64).optional(),
    title: z.string().trim().min(1).max(120),
    path: z
      .string()
      .trim()
      .regex(/^\/[a-z0-9-/]*$/, "Page path must start with / and use lowercase characters.")
      .max(80),
    content: z.string().trim().min(1).max(20_000),
  })
  .strict();

export const createSiteSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required.").max(SITE_NAME_MAX),
    slug: slugSchema,
    description: z
      .string()
      .trim()
      .max(500)
      .optional()
      .nullable()
      .transform((value) => (value ? value : null)),
    pages: z.array(sitePageSchema).min(1).max(20),
  })
  .strict();

export const updateSiteSchema = z
  .object({
    name: z.string().trim().min(1).max(SITE_NAME_MAX).optional(),
    slug: slugSchema.optional(),
    description: z
      .string()
      .trim()
      .max(500)
      .optional()
      .nullable()
      .transform((value) => (value ? value : null)),
    pages: z.array(sitePageSchema).min(1).max(20).optional(),
    status: z.enum(["draft", "published"]).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({ code: "custom", message: "At least one field is required." });
    }
  });

export const listSitesQuerySchema = z
  .object({
    q: z.string().trim().max(120).optional(),
    status: z.enum(["draft", "published"]).optional(),
    limit: z.coerce.number().int().min(1).max(SITE_LIST_LIMIT).optional(),
  })
  .strict();

export const siteIdSchema = z.string().trim().min(1).max(64);

export type SitePageInput = z.infer<typeof sitePageSchema>;
export type CreateSiteBody = z.infer<typeof createSiteSchema>;
export type UpdateSiteBody = z.infer<typeof updateSiteSchema>;
export type ListSitesQuery = z.infer<typeof listSitesQuerySchema>;
