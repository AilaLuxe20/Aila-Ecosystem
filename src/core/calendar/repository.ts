import { prisma } from "@/core/database/prisma";
import type { Prisma } from "@/generated/prisma";

import { CALENDAR_LIST_LIMIT } from "./types";
import type { CalendarEventRecord, ListCalendarEventsInput } from "./types";

export async function createCalendarEventForUser(
  userId: string,
  data: {
    title: string;
    description: string | null;
    location: string | null;
    startsAt: Date;
    endsAt: Date;
    allDay: boolean;
    timezone: string;
  },
): Promise<CalendarEventRecord> {
  return prisma.calendarEvent.create({
    data: {
      userId,
      title: data.title,
      description: data.description,
      location: data.location,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
      allDay: data.allDay,
      timezone: data.timezone,
    },
  });
}

export async function findCalendarEventForUser(
  userId: string,
  eventId: string,
): Promise<CalendarEventRecord | null> {
  return prisma.calendarEvent.findFirst({
    where: {
      id: eventId,
      userId,
    },
  });
}

export async function listCalendarEventsForUser(
  userId: string,
  input: ListCalendarEventsInput,
  limit = CALENDAR_LIST_LIMIT,
): Promise<CalendarEventRecord[]> {
  const where: Prisma.CalendarEventWhereInput = {
    userId,
  };

  if (input.status === "active") {
    where.archivedAt = null;
  } else if (input.status === "archived") {
    where.archivedAt = { not: null };
  }

  if (input.from || input.to) {
    where.AND = [
      input.to ? { startsAt: { lte: input.to } } : {},
      input.from ? { endsAt: { gte: input.from } } : {},
    ];
  }

  if (input.q) {
    where.OR = [
      { title: { contains: input.q, mode: "insensitive" } },
      { description: { contains: input.q, mode: "insensitive" } },
      { location: { contains: input.q, mode: "insensitive" } },
    ];
  }

  return prisma.calendarEvent.findMany({
    where,
    orderBy: [{ startsAt: "asc" }, { createdAt: "asc" }],
    take: limit,
  });
}

export async function updateCalendarEventForUser(
  userId: string,
  eventId: string,
  data: Prisma.CalendarEventUpdateInput,
): Promise<CalendarEventRecord | null> {
  const existing = await findCalendarEventForUser(userId, eventId);

  if (!existing) {
    return null;
  }

  return prisma.calendarEvent.update({
    where: { id: existing.id },
    data,
  });
}

export async function deleteCalendarEventForUser(
  userId: string,
  eventId: string,
): Promise<boolean> {
  const existing = await findCalendarEventForUser(userId, eventId);

  if (!existing) {
    return false;
  }

  await prisma.calendarEvent.delete({
    where: { id: existing.id },
  });

  return true;
}
