import { prisma } from "@/core/database/prisma";
import { NotFoundError } from "@/lib/errors/app-error";

import {
  HEALTH_LIST_LIMIT,
  type CreateHealthHabitBody,
  type CreateHealthLogBody,
  type ListHealthQuery,
  type UpdateHealthHabitBody,
  type UpdateHealthLogBody,
} from "./schema";

export type HealthHabitDto = {
  id: string;
  name: string;
  cadence: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type HealthLogDto = {
  id: string;
  kind: string;
  title: string;
  body: string;
  remindAt: string | null;
  done: boolean;
  loggedAt: string;
  createdAt: string;
  updatedAt: string;
};

function serializeHabit(record: {
  id: string;
  name: string;
  cadence: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}): HealthHabitDto {
  return {
    id: record.id,
    name: record.name,
    cadence: record.cadence,
    notes: record.notes,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function serializeLog(record: {
  id: string;
  kind: string;
  title: string;
  body: string;
  remindAt: Date | null;
  done: boolean;
  loggedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}): HealthLogDto {
  return {
    id: record.id,
    kind: record.kind,
    title: record.title,
    body: record.body,
    remindAt: record.remindAt?.toISOString() ?? null,
    done: record.done,
    loggedAt: record.loggedAt.toISOString(),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function formatHealthAiContext(habits: HealthHabitDto[], logs: HealthLogDto[]): string {
  return [
    "AILA HEALTH SNAPSHOT",
    "Aila Health organises wellness notes. It does not diagnose, treat, or replace a clinician.",
    `Habits: ${
      habits.length
        ? habits.map((habit) => `${habit.name} (${habit.cadence})`).join("; ")
        : "none"
    }`,
    `Logs: ${
      logs.length
        ? logs
            .slice(0, 12)
            .map((log) => `${log.kind} — ${log.title}${log.done ? " (done)" : ""}`)
            .join("; ")
        : "none"
    }`,
  ].join("\n");
}

export async function listHealthHabits(userId: string, query: ListHealthQuery = {}) {
  const records = await prisma.healthHabit.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: query.limit ?? HEALTH_LIST_LIMIT,
  });
  return records.map(serializeHabit);
}

export async function createHealthHabit(userId: string, body: CreateHealthHabitBody) {
  return serializeHabit(
    await prisma.healthHabit.create({
      data: {
        userId,
        name: body.name,
        cadence: body.cadence,
        notes: body.notes,
      },
    }),
  );
}

export async function updateHealthHabit(userId: string, id: string, body: UpdateHealthHabitBody) {
  const existing = await prisma.healthHabit.findFirst({ where: { id, userId } });
  if (!existing) throw new NotFoundError("Habit");

  return serializeHabit(
    await prisma.healthHabit.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.cadence !== undefined ? { cadence: body.cadence } : {}),
        ...(body.notes !== undefined ? { notes: body.notes ? body.notes : null } : {}),
      },
    }),
  );
}

export async function deleteHealthHabit(userId: string, id: string) {
  const existing = await prisma.healthHabit.findFirst({ where: { id, userId } });
  if (!existing) throw new NotFoundError("Habit");
  await prisma.healthHabit.delete({ where: { id } });
}

export async function listHealthLogs(userId: string, query: ListHealthQuery = {}) {
  const records = await prisma.healthLog.findMany({
    where: { userId },
    orderBy: { loggedAt: "desc" },
    take: query.limit ?? HEALTH_LIST_LIMIT,
  });
  return records.map(serializeLog);
}

export async function createHealthLog(userId: string, body: CreateHealthLogBody) {
  return serializeLog(
    await prisma.healthLog.create({
      data: {
        userId,
        kind: body.kind,
        title: body.title,
        body: body.body,
        remindAt: body.remindAt ? new Date(body.remindAt) : null,
        done: body.done,
      },
    }),
  );
}

export async function updateHealthLog(userId: string, id: string, body: UpdateHealthLogBody) {
  const existing = await prisma.healthLog.findFirst({ where: { id, userId } });
  if (!existing) throw new NotFoundError("Log");

  return serializeLog(
    await prisma.healthLog.update({
      where: { id },
      data: {
        ...(body.kind !== undefined ? { kind: body.kind } : {}),
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.body !== undefined ? { body: body.body } : {}),
        ...(body.remindAt !== undefined
          ? { remindAt: body.remindAt ? new Date(body.remindAt) : null }
          : {}),
        ...(body.done !== undefined ? { done: body.done } : {}),
      },
    }),
  );
}

export async function deleteHealthLog(userId: string, id: string) {
  const existing = await prisma.healthLog.findFirst({ where: { id, userId } });
  if (!existing) throw new NotFoundError("Log");
  await prisma.healthLog.delete({ where: { id } });
}
