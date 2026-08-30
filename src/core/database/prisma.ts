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

function isLocalDatabaseHost(databaseUrl: string): boolean {
  return /@:?(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(databaseUrl);
}

/**
 * pg v8 treats sslmode=require/prefer/verify-ca as verify-full. The next major
 * release will follow libpq (weaker). Pin the current secure behavior for
 * remote hosts without changing local unencrypted development URLs.
 */
export function resolvePostgresConnectionString(databaseUrl: string): string {
  if (
    databaseUrl.startsWith("prisma://") ||
    databaseUrl.startsWith("prisma+postgres://") ||
    isLocalDatabaseHost(databaseUrl)
  ) {
    return databaseUrl;
  }

  return databaseUrl.replace(
    /([?&]sslmode=)(require|prefer|verify-ca)(?=&|$)/i,
    "$1verify-full",
  );
}

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set.");
  }

  const resolvedUrl = resolvePostgresConnectionString(databaseUrl);

  if (resolvedUrl.startsWith("prisma://") || resolvedUrl.startsWith("prisma+postgres://")) {
    return new PrismaClient({ accelerateUrl: resolvedUrl });
  }

  return new PrismaClient({
    adapter: new PrismaPg(resolvedUrl),
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
