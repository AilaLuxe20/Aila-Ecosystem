import { ValidationError, NotFoundError } from "@/lib/errors/app-error";

import { canAccessCalendarEvent } from "./ownership";
import {
  createCalendarEventForUser,
  deleteCalendarEventForUser,
  findCalendarEventForUser,
  listCalendarEventsForUser,
  updateCalendarEventForUser,
} from "./repository";
import type {
  CreateCalendarEventBody,
  ListCalendarEventsQuery,
  UpdateCalendarEventBody,
} from "./schema";
import {
  CALENDAR_LIST_LIMIT,
  CALENDAR_MAX_SPAN_MS,
  type CalendarEventDto,
  type CalendarEventRecord,
} from "./types";

export function serializeCalendarEvent(record: CalendarEventRecord): CalendarEventDto {
  return {
    id: record.id,
    title: record.title,
    description: record.description,
    location: record.location,
    startsAt: record.startsAt.toISOString(),
    endsAt: record.endsAt.toISOString(),
    allDay: record.allDay,
    timezone: record.timezone,
    archivedAt: record.archivedAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function assertOwned(record: CalendarEventRecord, userId: string): void {
  if (!canAccessCalendarEvent(record, userId)) {
    throw new NotFoundError("Event");
  }
}

function assertValidSpan(startsAt: Date, endsAt: Date): void {
  if (!(endsAt.getTime() > startsAt.getTime())) {
    throw new ValidationError(
      { endsAt: "End must be after start." },
      { message: "End must be after start." },
    );
  }

  if (endsAt.getTime() - startsAt.getTime() > CALENDAR_MAX_SPAN_MS) {
    throw new ValidationError(
      { endsAt: "Events cannot span more than 366 days." },
      { message: "Events cannot span more than 366 days." },
    );
  }
}

export async function listUserCalendarEvents(
  userId: string,
  query: ListCalendarEventsQuery,
): Promise<CalendarEventDto[]> {
  const records = await listCalendarEventsForUser(
    userId,
    {
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
      q: query.q,
      status: query.status,
    },
    query.limit ?? CALENDAR_LIST_LIMIT,
  );

  return records.map(serializeCalendarEvent);
}

export async function getUserCalendarEvent(
  userId: string,
  eventId: string,
): Promise<CalendarEventDto> {
  const record = await findCalendarEventForUser(userId, eventId);

  if (!record) {
    throw new NotFoundError("Event");
  }

  assertOwned(record, userId);
  return serializeCalendarEvent(record);
}

export async function createUserCalendarEvent(
  userId: string,
  body: CreateCalendarEventBody,
): Promise<CalendarEventDto> {
  const startsAt = new Date(body.startsAt);
  const endsAt = new Date(body.endsAt);
  assertValidSpan(startsAt, endsAt);

  const record = await createCalendarEventForUser(userId, {
    title: body.title,
    description: body.description ?? null,
    location: body.location ?? null,
    startsAt,
    endsAt,
    allDay: body.allDay,
    timezone: body.timezone,
  });

  return serializeCalendarEvent(record);
}

export async function updateUserCalendarEvent(
  userId: string,
  eventId: string,
  body: UpdateCalendarEventBody,
): Promise<CalendarEventDto> {
  const existing = await findCalendarEventForUser(userId, eventId);

  if (!existing) {
    throw new NotFoundError("Event");
  }

  assertOwned(existing, userId);

  const startsAt = body.startsAt ? new Date(body.startsAt) : existing.startsAt;
  const endsAt = body.endsAt ? new Date(body.endsAt) : existing.endsAt;
  assertValidSpan(startsAt, endsAt);

  const archivedAt =
    body.archived === undefined
      ? undefined
      : body.archived
        ? (existing.archivedAt ?? new Date())
        : null;

  const record = await updateCalendarEventForUser(userId, eventId, {
    ...(body.title !== undefined ? { title: body.title } : {}),
    ...(body.description !== undefined ? { description: body.description || null } : {}),
    ...(body.location !== undefined ? { location: body.location || null } : {}),
    ...(body.startsAt !== undefined ? { startsAt } : {}),
    ...(body.endsAt !== undefined ? { endsAt } : {}),
    ...(body.allDay !== undefined ? { allDay: body.allDay } : {}),
    ...(body.timezone !== undefined ? { timezone: body.timezone } : {}),
    ...(archivedAt !== undefined ? { archivedAt } : {}),
  });

  if (!record) {
    throw new NotFoundError("Event");
  }

  return serializeCalendarEvent(record);
}

export async function deleteUserCalendarEvent(
  userId: string,
  eventId: string,
): Promise<void> {
  const existing = await findCalendarEventForUser(userId, eventId);

  if (!existing) {
    throw new NotFoundError("Event");
  }

  assertOwned(existing, userId);

  const deleted = await deleteCalendarEventForUser(userId, eventId);

  if (!deleted) {
    throw new NotFoundError("Event");
  }
}
