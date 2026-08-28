import { prisma } from "@/core/database/prisma";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors/app-error";

import { ADS_LIST_LIMIT, type CreateAdsCampaignBody, type ListAdsQuery, type UpdateAdsCampaignBody } from "./schema";

export type AdsCampaignDto = {
  id: string;
  name: string;
  objective: string;
  budgetCents: number;
  headline: string;
  body: string;
  targetingNotes: string | null;
  status: string;
  startsAt: string | null;
  endsAt: string | null;
  launchedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function serialize(record: {
  id: string;
  name: string;
  objective: string;
  budgetCents: number;
  headline: string;
  body: string;
  targetingNotes: string | null;
  status: string;
  startsAt: Date | null;
  endsAt: Date | null;
  launchedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): AdsCampaignDto {
  return {
    id: record.id,
    name: record.name,
    objective: record.objective,
    budgetCents: record.budgetCents,
    headline: record.headline,
    body: record.body,
    targetingNotes: record.targetingNotes,
    status: record.status,
    startsAt: record.startsAt?.toISOString() ?? null,
    endsAt: record.endsAt?.toISOString() ?? null,
    launchedAt: record.launchedAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export async function listUserAdsCampaigns(userId: string, query: ListAdsQuery) {
  const records = await prisma.adsCampaign.findMany({
    where: {
      userId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: "insensitive" } },
              { headline: { contains: query.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: query.limit ?? ADS_LIST_LIMIT,
  });

  return records.map(serialize);
}

export async function createUserAdsCampaign(userId: string, body: CreateAdsCampaignBody) {
  const record = await prisma.adsCampaign.create({
    data: {
      userId,
      name: body.name,
      objective: body.objective,
      budgetCents: body.budgetCents,
      headline: body.headline,
      body: body.body,
      targetingNotes: body.targetingNotes,
      startsAt: body.startsAt ? new Date(body.startsAt) : null,
      endsAt: body.endsAt ? new Date(body.endsAt) : null,
    },
  });

  return serialize(record);
}

export async function updateUserAdsCampaign(
  userId: string,
  id: string,
  body: UpdateAdsCampaignBody,
) {
  const existing = await prisma.adsCampaign.findFirst({ where: { id, userId } });

  if (!existing) {
    throw new NotFoundError("Campaign");
  }

  if (existing.status === "ended" && body.status && body.status !== "ended") {
    throw new ConflictError({ message: "Ended campaigns cannot be reopened." });
  }

  if (body.status === "active" && !existing.headline.trim()) {
    throw new ValidationError(
      { headline: "A headline is required before launching." },
      { message: "A headline is required before launching." },
    );
  }

  const record = await prisma.adsCampaign.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.objective !== undefined ? { objective: body.objective } : {}),
      ...(body.budgetCents !== undefined ? { budgetCents: body.budgetCents } : {}),
      ...(body.headline !== undefined ? { headline: body.headline } : {}),
      ...(body.body !== undefined ? { body: body.body } : {}),
      ...(body.targetingNotes !== undefined ? { targetingNotes: body.targetingNotes } : {}),
      ...(body.startsAt !== undefined ? { startsAt: body.startsAt ? new Date(body.startsAt) : null } : {}),
      ...(body.endsAt !== undefined ? { endsAt: body.endsAt ? new Date(body.endsAt) : null } : {}),
      ...(body.status !== undefined
        ? {
            status: body.status,
            launchedAt:
              body.status === "active" ? (existing.launchedAt ?? new Date()) : existing.launchedAt,
          }
        : {}),
    },
  });

  return serialize(record);
}

export async function deleteUserAdsCampaign(userId: string, id: string) {
  const existing = await prisma.adsCampaign.findFirst({ where: { id, userId } });

  if (!existing) {
    throw new NotFoundError("Campaign");
  }

  if (existing.status === "active") {
    throw new ConflictError({ message: "Pause or end an active campaign before deleting it." });
  }

  await prisma.adsCampaign.delete({ where: { id } });
}
