import { prisma } from "@/core/database/prisma";
import { NotFoundError } from "@/lib/errors/app-error";

import {
  SHIPPING_LIST_LIMIT,
  publicCarrierTrackingUrl,
  type CreateShippingShipmentBody,
  type ListShippingQuery,
  type UpdateShippingShipmentBody,
} from "./schema";

export type ShippingShipmentDto = {
  id: string;
  senderName: string;
  senderAddress: string;
  recipientName: string;
  recipientAddress: string;
  packageDesc: string;
  weightKg: number | null;
  carrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

function serializeWeight(value: unknown): number | null {
  if (value == null) return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function serialize(record: {
  id: string;
  senderName: string;
  senderAddress: string;
  recipientName: string;
  recipientAddress: string;
  packageDesc: string;
  weightKg: unknown;
  carrier: string | null;
  trackingNumber: string | null;
  status: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}): ShippingShipmentDto {
  return {
    id: record.id,
    senderName: record.senderName,
    senderAddress: record.senderAddress,
    recipientName: record.recipientName,
    recipientAddress: record.recipientAddress,
    packageDesc: record.packageDesc,
    weightKg: serializeWeight(record.weightKg),
    carrier: record.carrier,
    trackingNumber: record.trackingNumber,
    trackingUrl: publicCarrierTrackingUrl(record.carrier, record.trackingNumber),
    status: record.status,
    notes: record.notes,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function formatShippingAiContext(shipments: ShippingShipmentDto[]): string {
  return [
    "AILA SHIPPING SNAPSHOT",
    "Carrier live tracking is not connected. Tracking links are the carrier's public pages.",
    shipments.length
      ? shipments
          .map(
            (shipment) =>
              `${shipment.packageDesc} to ${shipment.recipientName} (${shipment.status})${
                shipment.trackingNumber
                  ? ` tracking ${shipment.trackingNumber}${shipment.carrier ? ` via ${shipment.carrier}` : ""}`
                  : ""
              }`,
          )
          .join("; ")
      : "No shipment records.",
  ].join("\n");
}

export async function listShippingShipments(userId: string, query: ListShippingQuery = {}) {
  const records = await prisma.shippingShipment.findMany({
    where: {
      userId,
      ...(query.status ? { status: query.status } : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: query.limit ?? SHIPPING_LIST_LIMIT,
  });
  return records.map(serialize);
}

export async function createShippingShipment(userId: string, body: CreateShippingShipmentBody) {
  return serialize(
    await prisma.shippingShipment.create({
      data: {
        userId,
        senderName: body.senderName,
        senderAddress: body.senderAddress,
        recipientName: body.recipientName,
        recipientAddress: body.recipientAddress,
        packageDesc: body.packageDesc,
        weightKg: body.weightKg ?? null,
        carrier: body.carrier,
        trackingNumber: body.trackingNumber,
        status: body.status,
        notes: body.notes,
      },
    }),
  );
}

export async function updateShippingShipment(
  userId: string,
  id: string,
  body: UpdateShippingShipmentBody,
) {
  const existing = await prisma.shippingShipment.findFirst({ where: { id, userId } });
  if (!existing) throw new NotFoundError("Shipment");

  return serialize(
    await prisma.shippingShipment.update({
      where: { id },
      data: {
        ...(body.senderName !== undefined ? { senderName: body.senderName } : {}),
        ...(body.senderAddress !== undefined ? { senderAddress: body.senderAddress } : {}),
        ...(body.recipientName !== undefined ? { recipientName: body.recipientName } : {}),
        ...(body.recipientAddress !== undefined ? { recipientAddress: body.recipientAddress } : {}),
        ...(body.packageDesc !== undefined ? { packageDesc: body.packageDesc } : {}),
        ...(body.weightKg !== undefined ? { weightKg: body.weightKg } : {}),
        ...(body.carrier !== undefined ? { carrier: body.carrier ? body.carrier : null } : {}),
        ...(body.trackingNumber !== undefined
          ? { trackingNumber: body.trackingNumber ? body.trackingNumber : null }
          : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(body.notes !== undefined ? { notes: body.notes ? body.notes : null } : {}),
      },
    }),
  );
}

export async function deleteShippingShipment(userId: string, id: string) {
  const existing = await prisma.shippingShipment.findFirst({ where: { id, userId } });
  if (!existing) throw new NotFoundError("Shipment");
  await prisma.shippingShipment.delete({ where: { id } });
}
