import { prisma } from "@/core/database/prisma";

export async function hasProcessedPaystackEvent(eventId: string): Promise<boolean> {
  const existing = await prisma.paystackWebhookEvent.findUnique({
    where: { id: eventId },
    select: { id: true },
  });
  return Boolean(existing);
}

export async function recordPaystackEvent(eventId: string, event: string): Promise<void> {
  try {
    await prisma.paystackWebhookEvent.create({
      data: { id: eventId, event },
    });
  } catch (error) {
    const code =
      typeof error === "object" && error && "code" in error
        ? (error as { code?: string }).code
        : undefined;
    if (code === "P2002") {
      return;
    }
    throw error;
  }
}
