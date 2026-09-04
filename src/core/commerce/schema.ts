import { z } from "zod";

export const COMMERCE_NAME_MAX = 160;
export const COMMERCE_LIST_LIMIT = 100;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => (value ? value : null));

export const createCommerceProductSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required.").max(COMMERCE_NAME_MAX),
    description: optionalText(5000),
    priceCents: z.number().int().min(0).max(100_000_000),
    currency: z.string().trim().length(3).toLowerCase().optional().default("usd"),
    sku: optionalText(64),
    inventory: z.number().int().min(0).max(1_000_000).optional().default(0),
    active: z.boolean().optional().default(true),
  })
  .strict();

export const updateCommerceProductSchema = createCommerceProductSchema
  .partial()
  .strict()
  .superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({ code: "custom", message: "At least one field is required." });
    }
  });

export const createCommerceOrderSchema = z
  .object({
    productId: z.string().trim().min(1).max(64),
    quantity: z.number().int().min(1).max(100).optional().default(1),
    customerName: z.string().trim().min(1).max(120),
    customerEmail: z.string().trim().email().max(200),
  })
  .strict();

export const updateCommerceOrderSchema = z
  .object({
    status: z.enum(["pending", "paid", "cancelled"]),
  })
  .strict();

export const listCommerceQuerySchema = z
  .object({
    q: z.string().trim().max(120).optional(),
    status: z.string().trim().optional(),
    active: z.enum(["true", "false"]).optional(),
    limit: z.coerce.number().int().min(1).max(COMMERCE_LIST_LIMIT).optional(),
  })
  .strict();

export const commerceIdSchema = z.string().trim().min(1).max(64);

export type CreateCommerceProductBody = z.infer<typeof createCommerceProductSchema>;
export type UpdateCommerceProductBody = z.infer<typeof updateCommerceProductSchema>;
export type CreateCommerceOrderBody = z.infer<typeof createCommerceOrderSchema>;
export type UpdateCommerceOrderBody = z.infer<typeof updateCommerceOrderSchema>;
export type ListCommerceQuery = z.infer<typeof listCommerceQuerySchema>;
