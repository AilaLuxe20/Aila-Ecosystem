import {
  calendarFailure,
  calendarReadRateLimiter,
  calendarWriteRateLimiter,
  enforceCalendarRateLimit,
  parseJsonBody,
  requireCalendarUser,
  searchParamsObject,
  withRateLimitHeaders,
} from "@/core/calendar/http";
import { createCalendarEventSchema, listCalendarEventsQuerySchema } from "@/core/calendar/schema";
import {
  createUserCalendarEvent,
  listUserCalendarEvents,
} from "@/core/calendar/service";
import { ValidationError } from "@/lib/errors/app-error";
import { created, ok } from "@/server/http/responses";

export async function GET(req: Request) {
  try {
    const user = await requireCalendarUser();
    const rateLimit = await enforceCalendarRateLimit(calendarReadRateLimiter, user.id);
    const query = parseJsonBody(
      searchParamsObject(new URL(req.url).searchParams),
      listCalendarEventsQuerySchema,
    );
    const events = await listUserCalendarEvents(user.id, query);

    return withRateLimitHeaders(ok({ events }), rateLimit);
  } catch (error) {
    return calendarFailure(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireCalendarUser();
    const rateLimit = await enforceCalendarRateLimit(calendarWriteRateLimiter, user.id);

    let rawBody: unknown;

    try {
      rawBody = await req.json();
    } catch {
      throw new ValidationError({}, { message: "Request body must be valid JSON." });
    }

    const body = parseJsonBody(rawBody, createCalendarEventSchema);
    const event = await createUserCalendarEvent(user.id, body);

    return withRateLimitHeaders(created({ event }), rateLimit);
  } catch (error) {
    return calendarFailure(error);
  }
}
