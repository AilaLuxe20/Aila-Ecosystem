/**
 * Prisma database client singleton.
 *
 * Prisma ORM 7 requires either a driver adapter (direct Postgres) or an
 * Accelerate URL. Instantiating PrismaClient with no options throws at query time.
 */

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma";

declare global {
  // Bump these names whenever the constructor options change so hot reload
  // cannot keep serving a PrismaClient created without a pooled adapter.
  var __ailaPrismaPool: Pool | undefined;
  var __ailaPrismaWithPool: PrismaClient | undefined;
}

let prismaPool: Pool | undefined;
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

/**
 * Neon and other hosted Postgres hosts drop idle or failed clients.
 * A real `pg.Pool` replaces those connections instead of leaving Prisma
 * stuck on a closed socket (`Server has closed the connection`).
 */
export function createPostgresPool(databaseUrl: string): Pool {
  const pool = new Pool({
    connectionString: resolvePostgresConnectionString(databaseUrl),
    max: 8,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 15_000,
    allowExitOnIdle: true,
  });

  pool.on("error", () => {
    // The pool discards the dead client. Query failures still surface.
  });

  return pool;
}

function getPostgresPool(databaseUrl: string): Pool {
  if (process.env.NODE_ENV === "production") {
    prismaPool ??= createPostgresPool(databaseUrl);
    return prismaPool;
  }

  global.__ailaPrismaPool ??= createPostgresPool(databaseUrl);
  return global.__ailaPrismaPool;
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
    adapter: new PrismaPg(getPostgresPool(databaseUrl), {
      onPoolError: () => undefined,
      onConnectionError: () => undefined,
    }),
  });
}

function getPrismaClient(): PrismaClient {
  if (process.env.NODE_ENV === "production") {
    prismaClient ??= createPrismaClient();
    return prismaClient;
  }

  global.__ailaPrismaWithPool ??= createPrismaClient();
  return global.__ailaPrismaWithPool;
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
