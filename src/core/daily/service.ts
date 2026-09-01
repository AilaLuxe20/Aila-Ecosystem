import { AILA_MODE_VALUES } from "@/core/ai/chat-api";
import { prisma } from "@/core/database/prisma";
import { PRODUCTS, productKeyFromMode } from "@/core/products/catalog";
import type { AilaMode } from "@/core/types";
import { NotFoundError } from "@/lib/errors/app-error";

import { buildDailyBriefing } from "./briefing";
import type {
  CreateDailyGoalBody,
  CreateDailyNoteBody,
  CreateDailyTaskBody,
  UpdateDailyGoalBody,
  UpdateDailyNoteBody,
  UpdateDailyTaskBody,
} from "./schema";
import {
  calendarDateInZone,
  dateOverlapsCivilDay,
  isOnCivilDay,
  isOnOrBeforeCivilDay,
} from "./timezone";

const AILA_MODES = new Set<AilaMode>(AILA_MODE_VALUES);

function conversationWorkspaceHref(mode: string): string {
  if (!AILA_MODES.has(mode as AilaMode)) {
    return PRODUCTS.intelligence.href;
  }

  return PRODUCTS[productKeyFromMode(mode as AilaMode)].href;
}

const NOTE_LIMIT = 40;
const GOAL_LIMIT = 40;
const TASK_LIMIT = 40;
const EVENT_WINDOW_MS = 36 * 60 * 60 * 1000;
const UPCOMING_LIMIT = 8;
const CONVERSATION_LIMIT = 8;
const DOCUMENT_LIMIT = 8;
const CAMPAIGN_LIMIT = 8;
const ACTIVITY_LIMIT = 12;

export type DailyNoteDto = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type DailyGoalDto = {
  id: string;
  title: string;
  status: string;
  dueAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DailyTaskDto = {
  id: string;
  title: string;
  notes: string | null;
  dueAt: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type DailyEventDto = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
};

export type DailyLinkDto = {
  id: string;
  title: string;
  href: string;
  at: string;
};

export type DailyActivityDto = DailyLinkDto & {
  kind: "conversation" | "document" | "campaign" | "note" | "goal" | "task" | "event";
};

export type DailyWorkspaceDto = {
  timezone: string;
  civilDate: string;
  briefing: string;
  goalProgress: {
    open: number;
    done: number;
    total: number;
    percent: number;
  };
  todayEvents: DailyEventDto[];
  upcomingEvents: DailyEventDto[];
  tasks: DailyTaskDto[];
  overdueTaskIds: string[];
  notes: DailyNoteDto[];
  goals: DailyGoalDto[];
  conversations: DailyLinkDto[];
  documents: DailyLinkDto[];
  campaigns: DailyLinkDto[];
  activity: DailyActivityDto[];
};

function serializeNote(record: {
  id: string;
  title: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}): DailyNoteDto {
  return {
    id: record.id,
    title: record.title,
    body: record.body,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function serializeGoal(record: {
  id: string;
  title: string;
  status: string;
  dueAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): DailyGoalDto {
  return {
    id: record.id,
    title: record.title,
    status: record.status,
    dueAt: record.dueAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function serializeTask(record: {
  id: string;
  title: string;
  notes: string | null;
  dueAt: Date | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): DailyTaskDto {
  return {
    id: record.id,
    title: record.title,
    notes: record.notes,
    dueAt: record.dueAt?.toISOString() ?? null,
    status: record.status,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function serializeEvent(record: {
  id: string;
  title: string;
  startsAt: Date;
  endsAt: Date;
  timezone: string;
}): DailyEventDto {
  return {
    id: record.id,
    title: record.title,
    startsAt: record.startsAt.toISOString(),
    endsAt: record.endsAt.toISOString(),
    timezone: record.timezone,
  };
}

export function formatDailyAiContext(workspace: DailyWorkspaceDto): string {
  const lines = [
    `AILA DAILY SNAPSHOT (${workspace.timezone}, civil date ${workspace.civilDate})`,
    `Briefing: ${workspace.briefing}`,
    `Goal progress: ${workspace.goalProgress.done}/${workspace.goalProgress.total} done.`,
    `Today's events: ${
      workspace.todayEvents.length
        ? workspace.todayEvents.map((event) => event.title).join("; ")
        : "none"
    }`,
    `Open tasks: ${
      workspace.tasks.filter((task) => task.status === "open").length
        ? workspace.tasks
            .filter((task) => task.status === "open")
            .map((task) => task.title)
            .join("; ")
        : "none"
    }`,
    `Goals: ${
      workspace.goals.length
        ? workspace.goals.map((goal) => `${goal.title} (${goal.status})`).join("; ")
        : "none"
    }`,
    `Notes: ${
      workspace.notes.length
        ? workspace.notes
            .slice(0, 8)
            .map((note) => `${note.title}: ${note.body.slice(0, 180)}`)
            .join(" | ")
        : "none"
    }`,
  ];

  return lines.join("\n");
}

export async function getDailyWorkspace(
  userId: string,
  timezone: string,
  now = new Date(),
): Promise<DailyWorkspaceDto> {
  const civilDate = calendarDateInZone(now, timezone);
  const windowStart = new Date(now.getTime() - EVENT_WINDOW_MS);
  const windowEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const [
    notes,
    goals,
    tasks,
    events,
    conversations,
    intelligenceDocuments,
    legalDocuments,
    campaigns,
  ] = await Promise.all([
    prisma.dailyNote.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: NOTE_LIMIT,
    }),
    prisma.dailyGoal.findMany({
      where: { userId },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      take: GOAL_LIMIT,
    }),
    prisma.businessTask.findMany({
      where: { userId },
      orderBy: [{ status: "asc" }, { dueAt: "asc" }],
      take: TASK_LIMIT,
    }),
    prisma.calendarEvent.findMany({
      where: {
        userId,
        archivedAt: null,
        startsAt: { lt: windowEnd },
        endsAt: { gt: windowStart },
      },
      orderBy: { startsAt: "asc" },
    }),
    prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: CONVERSATION_LIMIT,
      select: { id: true, title: true, mode: true, updatedAt: true },
    }),
    prisma.intelligenceDocument.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: DOCUMENT_LIMIT,
      select: { id: true, fileName: true, updatedAt: true },
    }),
    prisma.legalDocument.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: DOCUMENT_LIMIT,
      select: { id: true, fileName: true, updatedAt: true },
    }),
    prisma.adsCampaign.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: CAMPAIGN_LIMIT,
      select: { id: true, name: true, status: true, updatedAt: true },
    }),
  ]);

  const todayEvents = events
    .filter((event) => dateOverlapsCivilDay(event.startsAt, event.endsAt, civilDate, timezone))
    .map(serializeEvent);

  const upcomingEvents = events
    .filter((event) => event.startsAt.getTime() > now.getTime())
    .filter((event) => !dateOverlapsCivilDay(event.startsAt, event.endsAt, civilDate, timezone))
    .slice(0, UPCOMING_LIMIT)
    .map(serializeEvent);

  const openTasks = tasks.filter((task) => task.status === "open");
  const overdueTaskIds = openTasks
    .filter((task) => task.dueAt && isOnOrBeforeCivilDay(task.dueAt, civilDate, timezone) && !isOnCivilDay(task.dueAt, civilDate, timezone))
    .map((task) => task.id);

  const openGoals = goals.filter((goal) => goal.status === "open");
  const doneGoals = goals.filter((goal) => goal.status === "done");
  const totalGoals = goals.length;
  const percent = totalGoals === 0 ? 0 : Math.round((doneGoals.length / totalGoals) * 100);

  const conversationLinks: DailyLinkDto[] = conversations.map((item) => ({
    id: item.id,
    title: item.title?.trim() || `${item.mode} conversation`,
    href: conversationWorkspaceHref(item.mode),
    at: item.updatedAt.toISOString(),
  }));

  const documentLinks: DailyLinkDto[] = [
    ...intelligenceDocuments.map((item) => ({
      id: item.id,
      title: item.fileName,
      href: "/products/intelligence",
      at: item.updatedAt.toISOString(),
    })),
    ...legalDocuments.map((item) => ({
      id: item.id,
      title: item.fileName,
      href: "/products/ailalegal",
      at: item.updatedAt.toISOString(),
    })),
  ]
    .sort((left, right) => right.at.localeCompare(left.at))
    .slice(0, DOCUMENT_LIMIT);

  const campaignLinks: DailyLinkDto[] = campaigns.map((item) => ({
    id: item.id,
    title: `${item.name} (${item.status})`,
    href: "/products/ads",
    at: item.updatedAt.toISOString(),
  }));

  const activity: DailyActivityDto[] = [
    ...notes.map((item) => ({
      id: item.id,
      kind: "note" as const,
      title: item.title,
      href: "/products/daily",
      at: item.updatedAt.toISOString(),
    })),
    ...goals.map((item) => ({
      id: item.id,
      kind: "goal" as const,
      title: item.title,
      href: "/products/daily",
      at: item.updatedAt.toISOString(),
    })),
    ...tasks.map((item) => ({
      id: item.id,
      kind: "task" as const,
      title: item.title,
      href: "/products/daily",
      at: item.updatedAt.toISOString(),
    })),
    ...todayEvents.map((item) => ({
      id: item.id,
      kind: "event" as const,
      title: item.title,
      href: "/products/calendar",
      at: item.startsAt,
    })),
    ...conversationLinks.map((item) => ({ ...item, kind: "conversation" as const })),
    ...documentLinks.map((item) => ({ ...item, kind: "document" as const })),
    ...campaignLinks.map((item) => ({ ...item, kind: "campaign" as const })),
  ]
    .sort((left, right) => right.at.localeCompare(left.at))
    .slice(0, ACTIVITY_LIMIT);

  const workspace: DailyWorkspaceDto = {
    timezone,
    civilDate,
    briefing: buildDailyBriefing({
      timezone,
      civilDate,
      todayEventCount: todayEvents.length,
      upcomingEventCount: upcomingEvents.length,
      openTaskCount: openTasks.length,
      overdueTaskCount: overdueTaskIds.length,
      openGoalCount: openGoals.length,
      doneGoalCount: doneGoals.length,
      noteCount: notes.length,
    }),
    goalProgress: {
      open: openGoals.length,
      done: doneGoals.length,
      total: totalGoals,
      percent,
    },
    todayEvents,
    upcomingEvents,
    tasks: tasks.map(serializeTask),
    overdueTaskIds,
    notes: notes.map(serializeNote),
    goals: goals.map(serializeGoal),
    conversations: conversationLinks,
    documents: documentLinks,
    campaigns: campaignLinks,
    activity,
  };

  return workspace;
}

export async function createUserDailyNote(userId: string, body: CreateDailyNoteBody) {
  return serializeNote(
    await prisma.dailyNote.create({
      data: { userId, title: body.title, body: body.body },
    }),
  );
}

export async function updateUserDailyNote(userId: string, id: string, body: UpdateDailyNoteBody) {
  const existing = await prisma.dailyNote.findFirst({ where: { id, userId } });
  if (!existing) {
    throw new NotFoundError("Note");
  }

  return serializeNote(
    await prisma.dailyNote.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.body !== undefined ? { body: body.body } : {}),
      },
    }),
  );
}

export async function deleteUserDailyNote(userId: string, id: string) {
  const existing = await prisma.dailyNote.findFirst({ where: { id, userId } });
  if (!existing) {
    throw new NotFoundError("Note");
  }

  await prisma.dailyNote.delete({ where: { id } });
}

export async function createUserDailyGoal(userId: string, body: CreateDailyGoalBody) {
  return serializeGoal(
    await prisma.dailyGoal.create({
      data: {
        userId,
        title: body.title,
        status: body.status,
        dueAt: body.dueAt ? new Date(body.dueAt) : null,
      },
    }),
  );
}

export async function updateUserDailyGoal(userId: string, id: string, body: UpdateDailyGoalBody) {
  const existing = await prisma.dailyGoal.findFirst({ where: { id, userId } });
  if (!existing) {
    throw new NotFoundError("Goal");
  }

  return serializeGoal(
    await prisma.dailyGoal.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(body.dueAt !== undefined ? { dueAt: body.dueAt ? new Date(body.dueAt) : null } : {}),
      },
    }),
  );
}

export async function deleteUserDailyGoal(userId: string, id: string) {
  const existing = await prisma.dailyGoal.findFirst({ where: { id, userId } });
  if (!existing) {
    throw new NotFoundError("Goal");
  }

  await prisma.dailyGoal.delete({ where: { id } });
}

export async function createUserDailyTask(userId: string, body: CreateDailyTaskBody) {
  return serializeTask(
    await prisma.businessTask.create({
      data: {
        userId,
        title: body.title,
        notes: body.notes,
        dueAt: body.dueAt ? new Date(body.dueAt) : null,
        status: body.status,
      },
    }),
  );
}

export async function updateUserDailyTask(userId: string, id: string, body: UpdateDailyTaskBody) {
  const existing = await prisma.businessTask.findFirst({ where: { id, userId } });
  if (!existing) {
    throw new NotFoundError("Task");
  }

  return serializeTask(
    await prisma.businessTask.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.notes !== undefined ? { notes: body.notes } : {}),
        ...(body.dueAt !== undefined ? { dueAt: body.dueAt ? new Date(body.dueAt) : null } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
      },
    }),
  );
}

export async function deleteUserDailyTask(userId: string, id: string) {
  const existing = await prisma.businessTask.findFirst({ where: { id, userId } });
  if (!existing) {
    throw new NotFoundError("Task");
  }

  await prisma.businessTask.delete({ where: { id } });
}
