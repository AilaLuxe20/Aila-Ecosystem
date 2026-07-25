/**
 * Prisma database client singleton.
 *
 * Preserves the existing Prisma schema and generated client.
 * Do NOT regenerate models, rename tables, or change the schema.
 */

import { PrismaClient } from "@/generated/prisma";

declare global {
  // Allow global `var` for Prisma client in development to prevent
  // multiple instances during hot module replacement.
  var __prismaClient: PrismaClient | undefined;
}

let prismaClient: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prismaClient = new PrismaClient();
} else {
  if (!global.__prismaClient) {
    global.__prismaClient = new PrismaClient();
  }
  prismaClient = global.__prismaClient;
}

export { prismaClient as prisma };
export default prismaClient;
