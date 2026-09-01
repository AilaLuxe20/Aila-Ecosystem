import { z } from "zod";

export const FINANCE_LIST_LIMIT = 80;
export const FINANCE_ID_MAX = 64;
export const FINANCE_TRANSACTION_KINDS = ["income", "expense"] as const;
export const FINANCE_BUDGET_PERIODS = ["month"] as const;

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
  .min(1, "A date is required.")
  .refine((value) => !Number.isNaN(new Date(value).getTime()), "Enter a valid date.");

export const financeIdSchema = z.string().trim().min(1).max(FINANCE_ID_MAX);

export const listFinanceQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(FINANCE_LIST_LIMIT).optional(),
  })
  .strict();

export const createFinanceTransactionSchema = z
  .object({
    kind: z.enum(FINANCE_TRANSACTION_KINDS),
    amountCents: z.number().int().min(1).max(100_000_000),
    currency: z.string().trim().length(3).toLowerCase().optional().default("usd"),
    category: z.string().trim().min(1, "Category is required.").max(80),
    note: optionalText(500),
    occurredAt: isoDate,
  })
  .strict();

export const updateFinanceTransactionSchema = z
  .object({
    kind: z.enum(FINANCE_TRANSACTION_KINDS).optional(),
    amountCents: z.number().int().min(1).max(100_000_000).optional(),
    currency: z.string().trim().length(3).toLowerCase().optional(),
    category: z.string().trim().min(1).max(80).optional(),
    note: z.string().trim().max(500).optional().nullable(),
    occurredAt: isoDate.optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (
      value.kind === undefined &&
      value.amountCents === undefined &&
      value.currency === undefined &&
      value.category === undefined &&
      value.note === undefined &&
      value.occurredAt === undefined
    ) {
      ctx.addIssue({ code: "custom", message: "At least one field is required." });
    }
  });

export const createFinanceBudgetSchema = z
  .object({
    category: z.string().trim().min(1, "Category is required.").max(80),
    limitCents: z.number().int().min(1).max(100_000_000),
    period: z.enum(FINANCE_BUDGET_PERIODS).optional().default("month"),
  })
  .strict();

export const updateFinanceBudgetSchema = z
  .object({
    category: z.string().trim().min(1).max(80).optional(),
    limitCents: z.number().int().min(1).max(100_000_000).optional(),
    period: z.enum(FINANCE_BUDGET_PERIODS).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({ code: "custom", message: "At least one field is required." });
    }
  });

export const createFinanceGoalSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required.").max(160),
    targetCents: z.number().int().min(1).max(100_000_000),
    savedCents: z.number().int().min(0).max(100_000_000).optional().default(0),
  })
  .strict();

export const updateFinanceGoalSchema = z
  .object({
    title: z.string().trim().min(1).max(160).optional(),
    targetCents: z.number().int().min(1).max(100_000_000).optional(),
    savedCents: z.number().int().min(0).max(100_000_000).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({ code: "custom", message: "At least one field is required." });
    }
  });

export type CreateFinanceTransactionBody = z.infer<typeof createFinanceTransactionSchema>;
export type UpdateFinanceTransactionBody = z.infer<typeof updateFinanceTransactionSchema>;
export type CreateFinanceBudgetBody = z.infer<typeof createFinanceBudgetSchema>;
export type UpdateFinanceBudgetBody = z.infer<typeof updateFinanceBudgetSchema>;
export type CreateFinanceGoalBody = z.infer<typeof createFinanceGoalSchema>;
export type UpdateFinanceGoalBody = z.infer<typeof updateFinanceGoalSchema>;
export type ListFinanceQuery = z.infer<typeof listFinanceQuerySchema>;
