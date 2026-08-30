import { randomUUID } from "node:crypto";

import { Prisma } from "@/generated/prisma";

import { prisma } from "@/core/database/prisma";
import { NotFoundError } from "@/lib/errors/app-error";

import {
  TRAVEL_LIST_LIMIT,
  travelItemSchema,
  type CreateTravelTripBody,
  type ListTravelQuery,
  type TravelItemBody,
  type UpdateTravelTripBody,
} from "./schema";

export type TravelItemDto = {
  id: string;
  kind: "flight" | "stay" | "activity" | "note" | "reservation";
  title: string;
  details: string;
  startsAt: string | null;
};

export type TravelTripDto = {
  id: string;
  title: string;
  destination: string;
  startsOn: string | null;
  endsOn: string | null;
  notes: string | null;
  status: string;
  items: TravelItemDto[];
  createdAt: string;
  updatedAt: string;
};

function normalizeItems(items: TravelItemBody[]): TravelItemDto[] {
  return items.map((item) => ({
    id: item.id ?? randomUUID(),
    kind: item.kind,
    title: item.title,
    details: item.details,
    startsAt: item.startsAt,
  }));
}

function parseItems(value: unknown): TravelItemDto[] {
  if (!Array.isArray(value)) return [];
  const items: TravelItemDto[] = [];
  for (const entry of value) {
    const parsed = travelItemSchema.safeParse(entry);
    if (!parsed.success) continue;
    items.push({
      id: parsed.data.id ?? randomUUID(),
      kind: parsed.data.kind,
      title: parsed.data.title,
      details: parsed.data.details,
      startsAt: parsed.data.startsAt,
    });
  }
  return items;
}

function serialize(record: {
  id: string;
  title: string;
  destination: string;
  startsOn: Date | null;
  endsOn: Date | null;
  notes: string | null;
  status: string;
  items: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}): TravelTripDto {
  return {
    id: record.id,
    title: record.title,
    destination: record.destination,
    startsOn: record.startsOn?.toISOString() ?? null,
    endsOn: record.endsOn?.toISOString() ?? null,
    notes: record.notes,
    status: record.status,
    items: parseItems(record.items),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function formatTravelAiContext(trips: TravelTripDto[]): string {
  return [
    "AILA TRAVEL SNAPSHOT",
    "Aila does not book or confirm reservations.",
    trips.length
      ? trips
          .map((trip) => {
            const items = trip.items
              .map((item) => `${item.kind}: ${item.title}`)
              .join(", ");
            return `${trip.title} → ${trip.destination} (${trip.status})${items ? ` — ${items}` : ""}`;
          })
          .join("\n")
      : "No trips stored.",
  ].join("\n");
}

export async function listTravelTrips(userId: string, query: ListTravelQuery = {}) {
  const records = await prisma.travelTrip.findMany({
    where: {
      userId,
      ...(query.status ? { status: query.status } : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: query.limit ?? TRAVEL_LIST_LIMIT,
  });
  return records.map(serialize);
}

export async function createTravelTrip(userId: string, body: CreateTravelTripBody) {
  return serialize(
    await prisma.travelTrip.create({
      data: {
        userId,
        title: body.title,
        destination: body.destination,
        startsOn: body.startsOn ? new Date(body.startsOn) : null,
        endsOn: body.endsOn ? new Date(body.endsOn) : null,
        notes: body.notes,
        status: body.status,
        items: normalizeItems(body.items) as unknown as Prisma.InputJsonValue,
      },
    }),
  );
}

export async function updateTravelTrip(userId: string, id: string, body: UpdateTravelTripBody) {
  const existing = await prisma.travelTrip.findFirst({ where: { id, userId } });
  if (!existing) throw new NotFoundError("Trip");

  return serialize(
    await prisma.travelTrip.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.destination !== undefined ? { destination: body.destination } : {}),
        ...(body.startsOn !== undefined
          ? { startsOn: body.startsOn ? new Date(body.startsOn) : null }
          : {}),
        ...(body.endsOn !== undefined ? { endsOn: body.endsOn ? new Date(body.endsOn) : null } : {}),
        ...(body.notes !== undefined ? { notes: body.notes ? body.notes : null } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(body.items !== undefined
          ? { items: normalizeItems(body.items) as unknown as Prisma.InputJsonValue }
          : {}),
      },
    }),
  );
}

export async function deleteTravelTrip(userId: string, id: string) {
  const existing = await prisma.travelTrip.findFirst({ where: { id, userId } });
  if (!existing) throw new NotFoundError("Trip");
  await prisma.travelTrip.delete({ where: { id } });
}
