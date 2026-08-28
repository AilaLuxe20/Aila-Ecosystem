import { prisma } from "@/core/database/prisma";
import { NotFoundError } from "@/lib/errors/app-error";

import type {
  CreateBusinessContactBody,
  CreateBusinessTaskBody,
  ListBusinessQuery,
  UpdateBusinessContactBody,
  UpdateBusinessTaskBody,
} from "./schema";
import { BUSINESS_LIST_LIMIT } from "./schema";

export type BusinessContactDto = {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  phone: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type BusinessTaskDto = {
  id: string;
  contactId: string | null;
  title: string;
  notes: string | null;
  dueAt: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

function serializeContact(record: {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  phone: string | null;
  notes: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): BusinessContactDto {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    company: record.company,
    phone: record.phone,
    notes: record.notes,
    status: record.status,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function serializeTask(record: {
  id: string;
  contactId: string | null;
  title: string;
  notes: string | null;
  dueAt: Date | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): BusinessTaskDto {
  return {
    id: record.id,
    contactId: record.contactId,
    title: record.title,
    notes: record.notes,
    dueAt: record.dueAt?.toISOString() ?? null,
    status: record.status,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export async function listUserBusinessContacts(userId: string, query: ListBusinessQuery) {
  const records = await prisma.businessContact.findMany({
    where: {
      userId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: "insensitive" } },
              { company: { contains: query.q, mode: "insensitive" } },
              { email: { contains: query.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: query.limit ?? BUSINESS_LIST_LIMIT,
  });

  return records.map(serializeContact);
}

export async function createUserBusinessContact(userId: string, body: CreateBusinessContactBody) {
  const record = await prisma.businessContact.create({
    data: {
      userId,
      name: body.name,
      email: body.email,
      company: body.company,
      phone: body.phone,
      notes: body.notes,
      status: body.status,
    },
  });

  return serializeContact(record);
}

export async function updateUserBusinessContact(
  userId: string,
  id: string,
  body: UpdateBusinessContactBody,
) {
  const existing = await prisma.businessContact.findFirst({ where: { id, userId } });

  if (!existing) {
    throw new NotFoundError("Contact");
  }

  const record = await prisma.businessContact.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.email !== undefined ? { email: body.email } : {}),
      ...(body.company !== undefined ? { company: body.company } : {}),
      ...(body.phone !== undefined ? { phone: body.phone } : {}),
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
    },
  });

  return serializeContact(record);
}

export async function deleteUserBusinessContact(userId: string, id: string) {
  const existing = await prisma.businessContact.findFirst({ where: { id, userId } });

  if (!existing) {
    throw new NotFoundError("Contact");
  }

  await prisma.businessContact.delete({ where: { id } });
}

export async function listUserBusinessTasks(userId: string, query: ListBusinessQuery) {
  const records = await prisma.businessTask.findMany({
    where: {
      userId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: "insensitive" } },
              { notes: { contains: query.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ status: "asc" }, { dueAt: "asc" }, { updatedAt: "desc" }],
    take: query.limit ?? BUSINESS_LIST_LIMIT,
  });

  return records.map(serializeTask);
}

export async function createUserBusinessTask(userId: string, body: CreateBusinessTaskBody) {
  if (body.contactId) {
    const contact = await prisma.businessContact.findFirst({
      where: { id: body.contactId, userId },
    });

    if (!contact) {
      throw new NotFoundError("Contact");
    }
  }

  const record = await prisma.businessTask.create({
    data: {
      userId,
      title: body.title,
      notes: body.notes,
      contactId: body.contactId ?? null,
      dueAt: body.dueAt ? new Date(body.dueAt) : null,
      status: body.status,
    },
  });

  return serializeTask(record);
}

export async function updateUserBusinessTask(
  userId: string,
  id: string,
  body: UpdateBusinessTaskBody,
) {
  const existing = await prisma.businessTask.findFirst({ where: { id, userId } });

  if (!existing) {
    throw new NotFoundError("Task");
  }

  if (body.contactId) {
    const contact = await prisma.businessContact.findFirst({
      where: { id: body.contactId, userId },
    });

    if (!contact) {
      throw new NotFoundError("Contact");
    }
  }

  const record = await prisma.businessTask.update({
    where: { id },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
      ...(body.contactId !== undefined ? { contactId: body.contactId } : {}),
      ...(body.dueAt !== undefined ? { dueAt: body.dueAt ? new Date(body.dueAt) : null } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
    },
  });

  return serializeTask(record);
}

export async function deleteUserBusinessTask(userId: string, id: string) {
  const existing = await prisma.businessTask.findFirst({ where: { id, userId } });

  if (!existing) {
    throw new NotFoundError("Task");
  }

  await prisma.businessTask.delete({ where: { id } });
}
