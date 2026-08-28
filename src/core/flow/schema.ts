import { z } from "zod";

export const FLOW_NAME_MAX = 120;
export const FLOW_LIST_LIMIT = 40;

export const flowStepSchema = z
  .object({
    id: z.string().trim().min(1).max(64).optional(),
    title: z.string().trim().min(1).max(160),
    body: z
      .string()
      .trim()
      .max(5000)
      .optional()
      .nullable()
      .transform((value) => (value ? value : null)),
    status: z.enum(["pending", "done"]).optional().default("pending"),
  })
  .strict();

export const createFlowSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required.").max(FLOW_NAME_MAX),
    description: z
      .string()
      .trim()
      .max(1000)
      .optional()
      .nullable()
      .transform((value) => (value ? value : null)),
    steps: z.array(flowStepSchema).min(1).max(30),
  })
  .strict();

export const updateFlowSchema = z
  .object({
    name: z.string().trim().min(1).max(FLOW_NAME_MAX).optional(),
    description: z
      .string()
      .trim()
      .max(1000)
      .optional()
      .nullable()
      .transform((value) => (value ? value : null)),
    steps: z.array(flowStepSchema).min(1).max(30).optional(),
    status: z.enum(["draft", "active", "archived"]).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({ code: "custom", message: "At least one field is required." });
    }
  });

export const listFlowsQuerySchema = z
  .object({
    q: z.string().trim().max(120).optional(),
    status: z.enum(["draft", "active", "archived"]).optional(),
    limit: z.coerce.number().int().min(1).max(FLOW_LIST_LIMIT).optional(),
  })
  .strict();

export const flowIdSchema = z.string().trim().min(1).max(64);

export type FlowStepInput = z.infer<typeof flowStepSchema>;
export type CreateFlowBody = z.infer<typeof createFlowSchema>;
export type UpdateFlowBody = z.infer<typeof updateFlowSchema>;
export type ListFlowsQuery = z.infer<typeof listFlowsQuerySchema>;
