/**
 * Prisma database client singleton.
 *
 * Prisma client singleton for the schema in prisma/schema.prisma.
 */

import { PrismaClient } from "@/generated/prisma";

declare global {
  // Allow global `var` for Prisma client in development to prevent
  // multiple instances during hot module replacement.
  var __prismaClient: PrismaClient | undefined;
}

let prismaClient: PrismaClient | undefined;

function getPrismaClient(): PrismaClient {
  const accelerateUrl = process.env.DATABASE_URL?.startsWith("prisma")
    ? process.env.DATABASE_URL
    : undefined;
  const options = accelerateUrl ? { accelerateUrl } : undefined;

  if (process.env.NODE_ENV === "production") {
    prismaClient ??= new PrismaClient(options);
    return prismaClient;
  }

  if (!global.__prismaClient) {
    global.__prismaClient = new PrismaClient(options);
  }

  return global.__prismaClient;
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
