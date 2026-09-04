import { z } from "zod";

export const APP_NAME_MAX = 120;
export const APP_LIST_LIMIT = 80;
export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens.")
  .min(2)
  .max(48);

export const createAppListingSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required.").max(APP_NAME_MAX),
    slug: slugSchema,
    description: z.string().trim().min(1).max(5000),
    platform: z.enum(["web", "ios", "android"]),
    url: z
      .string()
      .trim()
      .url("Enter a valid URL.")
      .max(500)
      .optional()
      .nullable()
      .transform((value) => (value ? value : null)),
    status: z.enum(["draft", "live", "archived"]).optional().default("draft"),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.status === "live" && !value.url) {
      ctx.addIssue({
        code: "custom",
        path: ["url"],
        message: "A live app needs a URL.",
      });
    }
  });

export const updateAppListingSchema = z
  .object({
    name: z.string().trim().min(1).max(APP_NAME_MAX).optional(),
    slug: slugSchema.optional(),
    description: z.string().trim().min(1).max(5000).optional(),
    platform: z.enum(["web", "ios", "android"]).optional(),
    url: z
      .string()
      .trim()
      .url()
      .max(500)
      .optional()
      .nullable()
      .transform((value) => (value ? value : null)),
    status: z.enum(["draft", "live", "archived"]).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({ code: "custom", message: "At least one field is required." });
    }
  });

export const listAppsQuerySchema = z
  .object({
    q: z.string().trim().max(120).optional(),
    status: z.enum(["draft", "live", "archived"]).optional(),
    limit: z.coerce.number().int().min(1).max(APP_LIST_LIMIT).optional(),
  })
  .strict();

export const appIdSchema = z.string().trim().min(1).max(64);

export type CreateAppListingBody = z.infer<typeof createAppListingSchema>;
export type UpdateAppListingBody = z.infer<typeof updateAppListingSchema>;
export type ListAppsQuery = z.infer<typeof listAppsQuerySchema>;
