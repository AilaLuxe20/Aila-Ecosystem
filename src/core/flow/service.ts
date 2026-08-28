import { Prisma } from "@/generated/prisma";

import { prisma } from "@/core/database/prisma";
import { NotFoundError, ValidationError } from "@/lib/errors/app-error";

import {
  FLOW_LIST_LIMIT,
  flowStepSchema,
  type CreateFlowBody,
  type FlowStepInput,
  type ListFlowsQuery,
  type UpdateFlowBody,
} from "./schema";

export type FlowStepDto = {
  id: string;
  title: string;
  body: string | null;
  status: "pending" | "done";
};

export type FlowDto = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  steps: FlowStepDto[];
  createdAt: string;
  updatedAt: string;
};

function normalizeSteps(steps: FlowStepInput[]): FlowStepDto[] {
  return steps.map((step) => ({
    id: step.id ?? crypto.randomUUID(),
    title: step.title,
    body: step.body ?? null,
    status: step.status,
  }));
}

function parseSteps(value: Prisma.JsonValue): FlowStepDto[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    const parsed = flowStepSchema.safeParse(item);
    return parsed.success ? [normalizeSteps([parsed.data])[0]] : [];
  });
}

function serialize(record: {
  id: string;
  name: string;
  description: string | null;
  status: string;
  steps: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}): FlowDto {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    status: record.status,
    steps: parseSteps(record.steps),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export async function listUserFlows(userId: string, query: ListFlowsQuery) {
  const records = await prisma.flow.findMany({
    where: {
      userId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.q ? { name: { contains: query.q, mode: "insensitive" } } : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: query.limit ?? FLOW_LIST_LIMIT,
  });

  return records.map(serialize);
}

export async function createUserFlow(userId: string, body: CreateFlowBody) {
  const record = await prisma.flow.create({
    data: {
      userId,
      name: body.name,
      description: body.description,
      steps: normalizeSteps(body.steps) as unknown as Prisma.InputJsonValue,
    },
  });

  return serialize(record);
}

export async function updateUserFlow(userId: string, id: string, body: UpdateFlowBody) {
  const existing = await prisma.flow.findFirst({ where: { id, userId } });

  if (!existing) {
    throw new NotFoundError("Flow");
  }

  const record = await prisma.flow.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.steps !== undefined
        ? { steps: normalizeSteps(body.steps) as unknown as Prisma.InputJsonValue }
        : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
    },
  });

  return serialize(record);
}

export async function deleteUserFlow(userId: string, id: string) {
  const existing = await prisma.flow.findFirst({ where: { id, userId } });

  if (!existing) {
    throw new NotFoundError("Flow");
  }

  await prisma.flow.delete({ where: { id } });
}

export async function advanceUserFlow(userId: string, id: string) {
  const existing = await prisma.flow.findFirst({ where: { id, userId } });

  if (!existing) {
    throw new NotFoundError("Flow");
  }

  const steps = parseSteps(existing.steps);
  const nextIndex = steps.findIndex((step) => step.status === "pending");

  if (nextIndex === -1) {
    throw new ValidationError({}, { message: "Every step in this flow is already complete." });
  }

  const nextSteps = steps.map((step, index) =>
    index === nextIndex ? { ...step, status: "done" as const } : step,
  );

  const record = await prisma.flow.update({
    where: { id },
    data: {
      status: "active",
      steps: nextSteps as unknown as Prisma.InputJsonValue,
    },
  });

  return serialize(record);
}

export async function resetUserFlow(userId: string, id: string) {
  const existing = await prisma.flow.findFirst({ where: { id, userId } });

  if (!existing) {
    throw new NotFoundError("Flow");
  }

  const steps = parseSteps(existing.steps).map((step) => ({ ...step, status: "pending" as const }));

  const record = await prisma.flow.update({
    where: { id },
    data: {
      status: "draft",
      steps: steps as unknown as Prisma.InputJsonValue,
    },
  });

  return serialize(record);
}
