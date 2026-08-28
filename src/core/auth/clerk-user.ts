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
    const user = await tx.user.upsert({
      where: {
        email,
      },
      update: {
        name,
        image: clerkUser.imageUrl,
      },
      create: {
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
