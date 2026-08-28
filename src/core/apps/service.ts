import { Prisma } from "@/generated/prisma";

import { prisma } from "@/core/database/prisma";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors/app-error";

import { APP_LIST_LIMIT, type CreateAppListingBody, type ListAppsQuery, type UpdateAppListingBody } from "./schema";

export type AppListingDto = {
  id: string;
  name: string;
  slug: string;
  description: string;
  platform: string;
  url: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

function serialize(record: {
  id: string;
  name: string;
  slug: string;
  description: string;
  platform: string;
  url: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): AppListingDto {
  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    description: record.description,
    platform: record.platform,
    url: record.url,
    status: record.status,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function isUniqueViolation(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function listUserAppListings(userId: string, query: ListAppsQuery) {
  const records = await prisma.appListing.findMany({
    where: {
      userId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: "insensitive" } },
              { slug: { contains: query.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: query.limit ?? APP_LIST_LIMIT,
  });

  return records.map(serialize);
}

export async function createUserAppListing(userId: string, body: CreateAppListingBody) {
  try {
    const record = await prisma.appListing.create({
      data: {
        userId,
        name: body.name,
        slug: body.slug,
        description: body.description,
        platform: body.platform,
        url: body.url,
        status: body.status,
      },
    });

    return serialize(record);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError({ message: "You already have an app with this slug." });
    }

    throw error;
  }
}

export async function updateUserAppListing(userId: string, id: string, body: UpdateAppListingBody) {
  const existing = await prisma.appListing.findFirst({ where: { id, userId } });

  if (!existing) {
    throw new NotFoundError("App");
  }

  const nextStatus = body.status ?? existing.status;
  const nextUrl = body.url === undefined ? existing.url : body.url;

  if (nextStatus === "live" && !nextUrl) {
    throw new ValidationError(
      { url: "A live app needs a URL." },
      { message: "A live app needs a URL." },
    );
  }

  try {
    const record = await prisma.appListing.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.slug !== undefined ? { slug: body.slug } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.platform !== undefined ? { platform: body.platform } : {}),
        ...(body.url !== undefined ? { url: body.url } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
      },
    });

    return serialize(record);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError({ message: "You already have an app with this slug." });
    }

    throw error;
  }
}

export async function deleteUserAppListing(userId: string, id: string) {
  const existing = await prisma.appListing.findFirst({ where: { id, userId } });

  if (!existing) {
    throw new NotFoundError("App");
  }

  await prisma.appListing.delete({ where: { id } });
}
