import { prisma } from "@/core/database/prisma";

export async function hasProcessedPaystackEvent(eventId: string): Promise<boolean> {
  const existing = await prisma.paystackWebhookEvent.findUnique({
    where: { id: eventId },
    select: { id: true },
  });
  return Boolean(existing);
}

/**
 * Inserts the event id first. Returns true when this delivery owns processing,
 * false when another delivery already claimed the id (duplicate).
 */
export async function claimPaystackEvent(eventId: string, event: string): Promise<boolean> {
  try {
    await prisma.paystackWebhookEvent.create({
      data: { id: eventId, event },
    });
    return true;
  } catch (error) {
    const code =
      typeof error === "object" && error && "code" in error
        ? (error as { code?: string }).code
        : undefined;
    if (code === "P2002") {
      return false;
    }
    throw error;
  }
}

export async function recordPaystackEvent(eventId: string, event: string): Promise<void> {
  await claimPaystackEvent(eventId, event);
}
