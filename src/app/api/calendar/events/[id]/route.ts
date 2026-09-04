import {
  calendarFailure,
  calendarReadRateLimiter,
  calendarWriteRateLimiter,
  enforceCalendarRateLimit,
  parseJsonBody,
  requireCalendarUser,
  withRateLimitHeaders,
} from "@/core/calendar/http";
import { calendarEventIdSchema, updateCalendarEventSchema } from "@/core/calendar/schema";
import {
  deleteUserCalendarEvent,
  getUserCalendarEvent,
  updateUserCalendarEvent,
} from "@/core/calendar/service";
import { ValidationError } from "@/lib/errors/app-error";
import { noContent, ok } from "@/server/http/responses";

type EventRouteContext = {
  params: Promise<{ id: string }>;
};

async function parseEventId(context: EventRouteContext): Promise<string> {
  const { id } = await context.params;
  return parseJsonBody(id, calendarEventIdSchema);
}

export async function GET(_req: Request, context: EventRouteContext) {
  try {
    const user = await requireCalendarUser();
    const rateLimit = await enforceCalendarRateLimit(calendarReadRateLimiter, user.id);
    const eventId = await parseEventId(context);
    const event = await getUserCalendarEvent(user.id, eventId);

    return withRateLimitHeaders(ok({ event }), rateLimit);
  } catch (error) {
    return calendarFailure(error);
  }
}

export async function PATCH(req: Request, context: EventRouteContext) {
  try {
    const user = await requireCalendarUser();
    const rateLimit = await enforceCalendarRateLimit(calendarWriteRateLimiter, user.id);
    const eventId = await parseEventId(context);

    let rawBody: unknown;

    try {
      rawBody = await req.json();
    } catch {
      throw new ValidationError({}, { message: "Request body must be valid JSON." });
    }

    const body = parseJsonBody(rawBody, updateCalendarEventSchema);
    const event = await updateUserCalendarEvent(user.id, eventId, body);

    return withRateLimitHeaders(ok({ event }), rateLimit);
  } catch (error) {
    return calendarFailure(error);
  }
}

export async function DELETE(_req: Request, context: EventRouteContext) {
  try {
    const user = await requireCalendarUser();
    const rateLimit = await enforceCalendarRateLimit(calendarWriteRateLimiter, user.id);
    const eventId = await parseEventId(context);

    await deleteUserCalendarEvent(user.id, eventId);

    return withRateLimitHeaders(noContent(), rateLimit);
  } catch (error) {
    return calendarFailure(error);
  }
}
