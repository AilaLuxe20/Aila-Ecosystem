import { z } from "zod";

import {
  CALENDAR_DESCRIPTION_MAX,
  CALENDAR_EVENT_ID_MAX,
  CALENDAR_LIST_LIMIT,
  CALENDAR_LOCATION_MAX,
  CALENDAR_MAX_SPAN_MS,
  CALENDAR_SEARCH_MAX,
  CALENDAR_TITLE_MAX,
  CALENDAR_TIMEZONE_MAX,
} from "./types";

const isoDateTimeSchema = z
  .string()
  .trim()
  .min(1, "A date and time is required.")
  .refine((value) => {
    const parsed = new Date(value);
    return !Number.isNaN(parsed.getTime());
  }, "Enter a valid date and time.");

const createOptionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => (value ? value : null));

const updateOptionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional();

export const calendarEventIdSchema = z
  .string()
  .trim()
  .min(1, "Event id is required.")
  .max(CALENDAR_EVENT_ID_MAX);

function assertEventSpan(startsAt: Date, endsAt: Date): boolean {
  if (!(endsAt.getTime() > startsAt.getTime())) {
    return false;
  }

  return endsAt.getTime() - startsAt.getTime() <= CALENDAR_MAX_SPAN_MS;
}

export const createCalendarEventSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required.")
      .max(CALENDAR_TITLE_MAX, `Title must be ${CALENDAR_TITLE_MAX} characters or fewer.`),
    description: createOptionalText(CALENDAR_DESCRIPTION_MAX),
    location: createOptionalText(CALENDAR_LOCATION_MAX),
    startsAt: isoDateTimeSchema,
    endsAt: isoDateTimeSchema,
    allDay: z.boolean().optional().default(false),
    timezone: z
      .string()
      .trim()
      .min(1)
      .max(CALENDAR_TIMEZONE_MAX)
      .optional()
      .default("UTC"),
  })
  .strict()
  .superRefine((value, ctx) => {
    const startsAt = new Date(value.startsAt);
    const endsAt = new Date(value.endsAt);

    if (!(endsAt.getTime() > startsAt.getTime())) {
      ctx.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "End must be after start.",
      });
      return;
    }

    if (!assertEventSpan(startsAt, endsAt)) {
      ctx.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "Events cannot span more than 366 days.",
      });
    }
  });

export const updateCalendarEventSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required.")
      .max(CALENDAR_TITLE_MAX, `Title must be ${CALENDAR_TITLE_MAX} characters or fewer.`)
      .optional(),
    description: updateOptionalText(CALENDAR_DESCRIPTION_MAX),
    location: updateOptionalText(CALENDAR_LOCATION_MAX),
    startsAt: isoDateTimeSchema.optional(),
    endsAt: isoDateTimeSchema.optional(),
    allDay: z.boolean().optional(),
    timezone: z.string().trim().min(1).max(CALENDAR_TIMEZONE_MAX).optional(),
    archived: z.boolean().optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    const keys = Object.keys(value);
    if (keys.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: [],
        message: "At least one field is required.",
      });
    }

    if (value.startsAt && value.endsAt) {
      const startsAt = new Date(value.startsAt);
      const endsAt = new Date(value.endsAt);

      if (!(endsAt.getTime() > startsAt.getTime())) {
        ctx.addIssue({
          code: "custom",
          path: ["endsAt"],
          message: "End must be after start.",
        });
      } else if (!assertEventSpan(startsAt, endsAt)) {
        ctx.addIssue({
          code: "custom",
          path: ["endsAt"],
          message: "Events cannot span more than 366 days.",
        });
      }
    }
  });

export const listCalendarEventsQuerySchema = z
  .object({
    from: isoDateTimeSchema.optional(),
    to: isoDateTimeSchema.optional(),
    q: z.string().trim().max(CALENDAR_SEARCH_MAX).optional(),
    status: z.enum(["active", "archived", "all"]).optional().default("active"),
    limit: z.coerce.number().int().min(1).max(CALENDAR_LIST_LIMIT).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.from && value.to && new Date(value.to) < new Date(value.from)) {
      ctx.addIssue({
        code: "custom",
        path: ["to"],
        message: "Range end must be on or after range start.",
      });
    }
  });

export type CreateCalendarEventBody = z.infer<typeof createCalendarEventSchema>;
export type UpdateCalendarEventBody = z.infer<typeof updateCalendarEventSchema>;
export type ListCalendarEventsQuery = z.infer<typeof listCalendarEventsQuerySchema>;
