import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as {
  prisma?: PrismaClient;
};

let prisma: PrismaClient | undefined = globalForPrisma.prisma;

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "Missing DATABASE_URL environment variable for Prisma client"
    );
  }

  return new PrismaClient({
    adapter: new PrismaPg(databaseUrl),
  });
}

export function getPrismaClient() {
  if (!prisma) {
    prisma = createPrismaClient();

    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = prisma;
    }
  }

  return prisma;
}
