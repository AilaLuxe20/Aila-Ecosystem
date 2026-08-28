import { z } from "zod";

export const AUTOMATION_NAME_MAX = 120;
export const AUTOMATION_LIST_LIMIT = 80;

const emailActionSchema = z
  .object({
    to: z.string().trim().email(),
    subject: z.string().trim().min(1).max(180),
    body: z.string().trim().min(1).max(5000),
  })
  .strict();

const calendarActionSchema = z
  .object({
    title: z.string().trim().min(1).max(160),
    description: z.string().trim().max(5000).optional().nullable(),
    startsAt: z.string().trim().min(1),
    endsAt: z.string().trim().min(1),
  })
  .strict();

const taskActionSchema = z
  .object({
    title: z.string().trim().min(1).max(160),
    notes: z.string().trim().max(5000).optional().nullable(),
  })
  .strict();

export const automationActionPayloadSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("email"), ...emailActionSchema.shape }).strict(),
  z.object({ type: z.literal("calendar_event"), ...calendarActionSchema.shape }).strict(),
  z.object({ type: z.literal("business_task"), ...taskActionSchema.shape }).strict(),
]);

export const createAutomationRuleSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required.").max(AUTOMATION_NAME_MAX),
    enabled: z.boolean().optional().default(true),
    triggerType: z.enum(["manual", "interval"]),
    intervalHours: z.number().int().min(1).max(168).optional().nullable(),
    actionType: z.enum(["email", "calendar_event", "business_task"]),
    actionPayload: z.record(z.string(), z.unknown()),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.triggerType === "interval" && !value.intervalHours) {
      ctx.addIssue({
        code: "custom",
        path: ["intervalHours"],
        message: "Interval automations need hours between 1 and 168.",
      });
    }

    const payload = automationActionPayloadSchema.safeParse({
      type: value.actionType,
      ...value.actionPayload,
    });

    if (!payload.success) {
      ctx.addIssue({
        code: "custom",
        path: ["actionPayload"],
        message: "Action details are incomplete or invalid.",
      });
    }
  });

export const updateAutomationRuleSchema = z
  .object({
    name: z.string().trim().min(1).max(AUTOMATION_NAME_MAX).optional(),
    enabled: z.boolean().optional(),
    triggerType: z.enum(["manual", "interval"]).optional(),
    intervalHours: z.number().int().min(1).max(168).optional().nullable(),
    actionType: z.enum(["email", "calendar_event", "business_task"]).optional(),
    actionPayload: z.record(z.string(), z.unknown()).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({ code: "custom", message: "At least one field is required." });
    }
  });

export const listAutomationQuerySchema = z
  .object({
    q: z.string().trim().max(120).optional(),
    limit: z.coerce.number().int().min(1).max(AUTOMATION_LIST_LIMIT).optional(),
  })
  .strict();

export const automationIdSchema = z.string().trim().min(1).max(64);

export type CreateAutomationRuleBody = z.infer<typeof createAutomationRuleSchema>;
export type UpdateAutomationRuleBody = z.infer<typeof updateAutomationRuleSchema>;
export type ListAutomationQuery = z.infer<typeof listAutomationQuerySchema>;
export type AutomationActionPayload = z.infer<typeof automationActionPayloadSchema>;
