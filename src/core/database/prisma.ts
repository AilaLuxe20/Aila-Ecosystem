/**
 * Prisma database client singleton.
 *
 * Prisma ORM 7 requires either a driver adapter (direct Postgres) or an
 * Accelerate URL. Instantiating PrismaClient with no options throws at query time.
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma";

declare global {
  // Bump this name whenever the constructor options change so hot reload
  // cannot keep serving a PrismaClient created without an adapter.
  var __ailaPrismaWithAdapter: PrismaClient | undefined;
}

let prismaClient: PrismaClient | undefined;

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set.");
  }

  if (databaseUrl.startsWith("prisma://") || databaseUrl.startsWith("prisma+postgres://")) {
    return new PrismaClient({ accelerateUrl: databaseUrl });
  }

  return new PrismaClient({
    adapter: new PrismaPg(databaseUrl),
  });
}

function getPrismaClient(): PrismaClient {
  if (process.env.NODE_ENV === "production") {
    prismaClient ??= createPrismaClient();
    return prismaClient;
  }

  global.__ailaPrismaWithAdapter ??= createPrismaClient();
  return global.__ailaPrismaWithAdapter;
}

const prisma = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    const value = Reflect.get(getPrismaClient(), property, receiver);

    if (typeof value === "function") {
      return value.bind(getPrismaClient());
    }

    return value;
  },
});

export { prisma, getPrismaClient };
export default prisma;
