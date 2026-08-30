import { prisma } from "@/core/database/prisma";

export async function hasProcessedStripeEvent(eventId: string): Promise<boolean> {
  const existing = await prisma.stripeWebhookEvent.findUnique({
    where: { id: eventId },
    select: { id: true },
  });
  return Boolean(existing);
}

export async function recordStripeEvent(eventId: string, type: string): Promise<void> {
  try {
    await prisma.stripeWebhookEvent.create({
      data: { id: eventId, type },
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
