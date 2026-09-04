import { z } from "zod";

export const TRAVEL_LIST_LIMIT = 80;
export const TRAVEL_ID_MAX = 64;
export const TRAVEL_STATUSES = ["planning", "upcoming", "done"] as const;
export const TRAVEL_ITEM_KINDS = ["flight", "stay", "activity", "note", "reservation"] as const;

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

export const travelIdSchema = z.string().trim().min(1).max(TRAVEL_ID_MAX);

export const travelItemSchema = z
  .object({
    id: z.string().trim().min(1).max(TRAVEL_ID_MAX).optional(),
    kind: z.enum(TRAVEL_ITEM_KINDS),
    title: z.string().trim().min(1, "Item title is required.").max(160),
    details: z.string().trim().max(4_000).optional().default(""),
    startsAt: optionalIsoDate,
  })
  .strict();

export const listTravelQuerySchema = z
  .object({
    status: z.enum(TRAVEL_STATUSES).optional(),
    limit: z.coerce.number().int().min(1).max(TRAVEL_LIST_LIMIT).optional(),
  })
  .strict();

export const createTravelTripSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required.").max(160),
    destination: z.string().trim().min(1, "Destination is required.").max(160),
    startsOn: optionalIsoDate,
    endsOn: optionalIsoDate,
    notes: optionalText(8_000),
    status: z.enum(TRAVEL_STATUSES).optional().default("planning"),
    items: z.array(travelItemSchema).max(80).optional().default([]),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.startsOn && value.endsOn && new Date(value.endsOn) < new Date(value.startsOn)) {
      ctx.addIssue({
        code: "custom",
        path: ["endsOn"],
        message: "The end date cannot be before the start date.",
      });
    }
  });

export const updateTravelTripSchema = z
  .object({
    title: z.string().trim().min(1).max(160).optional(),
    destination: z.string().trim().min(1).max(160).optional(),
    startsOn: z
      .string()
      .trim()
      .min(1)
      .refine((value) => !Number.isNaN(new Date(value).getTime()), "Enter a valid date.")
      .optional()
      .nullable(),
    endsOn: z
      .string()
      .trim()
      .min(1)
      .refine((value) => !Number.isNaN(new Date(value).getTime()), "Enter a valid date.")
      .optional()
      .nullable(),
    notes: z.string().trim().max(8_000).optional().nullable(),
    status: z.enum(TRAVEL_STATUSES).optional(),
    items: z.array(travelItemSchema).max(80).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (
      value.title === undefined &&
      value.destination === undefined &&
      value.startsOn === undefined &&
      value.endsOn === undefined &&
      value.notes === undefined &&
      value.status === undefined &&
      value.items === undefined
    ) {
      ctx.addIssue({ code: "custom", message: "At least one field is required." });
    }
    if (value.startsOn && value.endsOn && new Date(value.endsOn) < new Date(value.startsOn)) {
      ctx.addIssue({
        code: "custom",
        path: ["endsOn"],
        message: "The end date cannot be before the start date.",
      });
    }
  });

export type TravelItemBody = z.infer<typeof travelItemSchema>;
export type CreateTravelTripBody = z.infer<typeof createTravelTripSchema>;
export type UpdateTravelTripBody = z.infer<typeof updateTravelTripSchema>;
export type ListTravelQuery = z.infer<typeof listTravelQuerySchema>;
