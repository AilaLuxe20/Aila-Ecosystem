import { Prisma } from "@/generated/prisma";
import { Resend } from "resend";

import { createUserBusinessTask } from "@/core/business/service";
import { createUserCalendarEvent } from "@/core/calendar/service";
import { getResendApiKey, getResendFromEmail } from "@/core/config";
import { prisma } from "@/core/database/prisma";
import { ConfigurationError, ExternalServiceError, NotFoundError } from "@/lib/errors/app-error";

import {
  AUTOMATION_LIST_LIMIT,
  automationActionPayloadSchema,
  type CreateAutomationRuleBody,
  type ListAutomationQuery,
  type UpdateAutomationRuleBody,
} from "./schema";

export type AutomationRuleDto = {
  id: string;
  name: string;
  enabled: boolean;
  triggerType: string;
  intervalHours: number | null;
  actionType: string;
  actionPayload: Record<string, unknown>;
  lastRunAt: string | null;
  lastStatus: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AutomationRunDto = {
  id: string;
  ruleId: string;
  status: string;
  message: string;
  createdAt: string;
};

function asPayload(value: Prisma.JsonValue): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

function serializeRule(record: {
  id: string;
  name: string;
  enabled: boolean;
  triggerType: string;
  intervalHours: number | null;
  actionType: string;
  actionPayload: Prisma.JsonValue;
  lastRunAt: Date | null;
  lastStatus: string | null;
  lastError: string | null;
  createdAt: Date;
  updatedAt: Date;
}): AutomationRuleDto {
  return {
    id: record.id,
    name: record.name,
    enabled: record.enabled,
    triggerType: record.triggerType,
    intervalHours: record.intervalHours,
    actionType: record.actionType,
    actionPayload: asPayload(record.actionPayload),
    lastRunAt: record.lastRunAt?.toISOString() ?? null,
    lastStatus: record.lastStatus,
    lastError: record.lastError,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function serializeRun(record: {
  id: string;
  ruleId: string;
  status: string;
  message: string;
  createdAt: Date;
}): AutomationRunDto {
  return {
    id: record.id,
    ruleId: record.ruleId,
    status: record.status,
    message: record.message,
    createdAt: record.createdAt.toISOString(),
  };
}

async function executeAction(
  userId: string,
  actionType: string,
  payload: Record<string, unknown>,
): Promise<string> {
  const parsed = automationActionPayloadSchema.parse({ type: actionType, ...payload });

  if (parsed.type === "email") {
    const apiKey = getResendApiKey();

    if (!apiKey) {
      throw new ConfigurationError({
        message: "RESEND_API_KEY is required to send automation emails.",
      });
    }

    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: getResendFromEmail(),
      to: [parsed.to],
      subject: parsed.subject,
      text: parsed.body,
    });

    if (result.error) {
      throw new ExternalServiceError("Resend", {
        message: result.error.message,
      });
    }

    return `Email sent to ${parsed.to}.`;
  }

  if (parsed.type === "calendar_event") {
    const event = await createUserCalendarEvent(userId, {
      title: parsed.title,
      description: parsed.description ?? null,
      location: null,
      startsAt: parsed.startsAt,
      endsAt: parsed.endsAt,
      allDay: false,
      timezone: "UTC",
    });

    return `Calendar event created: ${event.title}.`;
  }

  const task = await createUserBusinessTask(userId, {
    title: parsed.title,
    notes: parsed.notes ?? null,
    contactId: null,
    dueAt: null,
    status: "open",
  });

  return `Task created: ${task.title}.`;
}

export async function listUserAutomationRules(userId: string, query: ListAutomationQuery) {
  const records = await prisma.automationRule.findMany({
    where: {
      userId,
      ...(query.q ? { name: { contains: query.q, mode: "insensitive" } } : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: query.limit ?? AUTOMATION_LIST_LIMIT,
  });

  return records.map(serializeRule);
}

export async function listUserAutomationRuns(userId: string, ruleId?: string) {
  const records = await prisma.automationRun.findMany({
    where: { userId, ...(ruleId ? { ruleId } : {}) },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return records.map(serializeRun);
}

export async function createUserAutomationRule(userId: string, body: CreateAutomationRuleBody) {
  const record = await prisma.automationRule.create({
    data: {
      userId,
      name: body.name,
      enabled: body.enabled,
      triggerType: body.triggerType,
      intervalHours: body.triggerType === "interval" ? body.intervalHours : null,
      actionType: body.actionType,
      actionPayload: body.actionPayload as Prisma.InputJsonValue,
    },
  });

  return serializeRule(record);
}

export async function updateUserAutomationRule(
  userId: string,
  id: string,
  body: UpdateAutomationRuleBody,
) {
  const existing = await prisma.automationRule.findFirst({ where: { id, userId } });

  if (!existing) {
    throw new NotFoundError("Automation");
  }

  const record = await prisma.automationRule.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.enabled !== undefined ? { enabled: body.enabled } : {}),
      ...(body.triggerType !== undefined ? { triggerType: body.triggerType } : {}),
      ...(body.intervalHours !== undefined ? { intervalHours: body.intervalHours } : {}),
      ...(body.actionType !== undefined ? { actionType: body.actionType } : {}),
      ...(body.actionPayload !== undefined
        ? { actionPayload: body.actionPayload as Prisma.InputJsonValue }
        : {}),
    },
  });

  return serializeRule(record);
}

export async function deleteUserAutomationRule(userId: string, id: string) {
  const existing = await prisma.automationRule.findFirst({ where: { id, userId } });

  if (!existing) {
    throw new NotFoundError("Automation");
  }

  await prisma.automationRule.delete({ where: { id } });
}

export async function runUserAutomationRule(userId: string, id: string) {
  const existing = await prisma.automationRule.findFirst({ where: { id, userId } });

  if (!existing) {
    throw new NotFoundError("Automation");
  }

  try {
    const message = await executeAction(userId, existing.actionType, asPayload(existing.actionPayload));
    const run = await prisma.automationRun.create({
      data: { userId, ruleId: id, status: "ok", message },
    });

    await prisma.automationRule.update({
      where: { id },
      data: { lastRunAt: new Date(), lastStatus: "ok", lastError: null },
    });

    return serializeRun(run);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Automation failed.";
    await prisma.automationRun.create({
      data: { userId, ruleId: id, status: "error", message },
    });

    await prisma.automationRule.update({
      where: { id },
      data: { lastRunAt: new Date(), lastStatus: "error", lastError: message },
    });

    throw error;
  }
}

export async function runDueIntervalAutomations(userId?: string) {
  const now = Date.now();
  const rules = await prisma.automationRule.findMany({
    where: {
      enabled: true,
      triggerType: "interval",
      ...(userId ? { userId } : {}),
    },
  });

  const due = rules.filter((rule) => {
    if (!rule.intervalHours) {
      return false;
    }

    if (!rule.lastRunAt) {
      return true;
    }

    return now - rule.lastRunAt.getTime() >= rule.intervalHours * 60 * 60 * 1000;
  });

  const results = [];

  for (const rule of due) {
    try {
      results.push({
        ruleId: rule.id,
        run: await runUserAutomationRule(rule.userId, rule.id),
      });
    } catch {
      results.push({ ruleId: rule.id, run: null });
    }
  }

  return results;
}
