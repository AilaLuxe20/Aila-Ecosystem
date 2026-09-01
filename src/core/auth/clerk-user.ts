import { auth, currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/core/database/prisma";

export class AilaAuthenticationError extends Error {
  constructor(message = "Authentication required.") {
    super(message);
    this.name = "AilaAuthenticationError";
  }
}

export async function requirePrismaUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new AilaAuthenticationError();
  }

  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new AilaAuthenticationError("Unable to resolve the signed-in user.");
  }

  const linkedAccount = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: "clerk",
        providerAccountId: userId,
      },
    },
    include: {
      user: true,
    },
  });

  if (linkedAccount) {
    return linkedAccount.user;
  }

  const email =
    clerkUser.primaryEmailAddress?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    throw new AilaAuthenticationError("A verified email is required.");
  }

  const name =
    clerkUser.fullName ??
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ??
    null;

  return prisma.$transaction(async (tx) => {
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
        (account) => account.providerAccountId !== userId,
      );

      if (foreign) {
        throw new AilaAuthenticationError(
          "This email is already linked to another account.",
        );
      }
    }

    const user = existing
      ? await tx.user.update({
          where: { id: existing.id },
          data: {
            name,
            image: clerkUser.imageUrl,
          },
        })
      : await tx.user.create({
          data: {
            email,
            name,
            image: clerkUser.imageUrl,
          },
        });

    await tx.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: "clerk",
          providerAccountId: userId,
        },
      },
      update: {
        userId: user.id,
      },
      create: {
        userId: user.id,
        type: "clerk",
        provider: "clerk",
        providerAccountId: userId,
      },
    });

    return user;
  });
}

export async function getPrismaUserOrNull() {
  try {
    return await requirePrismaUser();
  } catch (error) {
    if (error instanceof AilaAuthenticationError) {
      return null;
    }

    throw error;
  }
}
