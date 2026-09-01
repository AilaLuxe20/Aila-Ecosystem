import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { NextRequest } from "next/server";

import { prisma } from "@/core/database/prisma";
import { createLogger } from "@/lib/logger/logger";
import { failure, ok } from "@/server/http/responses";

const log = createLogger("webhooks.clerk");

function primaryEmail(data: {
  email_addresses?: Array<{ id: string; email_address: string }>;
  primary_email_address_id?: string | null;
}): string | null {
  const emails = data.email_addresses ?? [];
  const primary = emails.find((email) => email.id === data.primary_email_address_id);
  return primary?.email_address ?? emails[0]?.email_address ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const event = await verifyWebhook(req);

    if (event.type === "user.created" || event.type === "user.updated") {
      const email = primaryEmail(event.data);
      if (!email) {
        log.warn("Clerk user event had no email.", { type: event.type });
        return ok({ received: true });
      }

      const name =
        [event.data.first_name, event.data.last_name].filter(Boolean).join(" ") ||
        event.data.username ||
        null;

      await prisma.$transaction(async (tx) => {
        const existing = await tx.user.findUnique({
          where: { email },
          include: {
            accounts: {
              where: { provider: "clerk" },
            },
          },
        });

        if (existing) {
          const foreign = existing.accounts.find(
            (account) => account.providerAccountId !== event.data.id,
          );

          if (foreign) {
            log.warn("Clerk webhook skipped email merge.", { type: event.type });
            return;
          }
        }

        const user = existing
          ? await tx.user.update({
              where: { id: existing.id },
              data: {
                name,
                image: event.data.image_url,
              },
            })
          : await tx.user.create({
              data: {
                email,
                name,
                image: event.data.image_url,
              },
            });

        await tx.account.upsert({
          where: {
            provider_providerAccountId: {
              provider: "clerk",
              providerAccountId: event.data.id,
            },
          },
          update: { userId: user.id },
          create: {
            userId: user.id,
            type: "clerk",
            provider: "clerk",
            providerAccountId: event.data.id,
          },
        });
      });
    }

    if (event.type === "user.deleted" && event.data.id) {
      const accounts = await prisma.account.findMany({
        where: {
          provider: "clerk",
          providerAccountId: event.data.id,
        },
        select: { userId: true },
      });

      for (const account of accounts) {
        await prisma.user.delete({
          where: { id: account.userId },
        });
      }
    }

    return ok({ received: true });
  } catch (error) {
    log.warn("Clerk webhook rejected.", {
      error: error instanceof Error ? error.name : "unknown",
    });
    return failure(error);
  }
}
