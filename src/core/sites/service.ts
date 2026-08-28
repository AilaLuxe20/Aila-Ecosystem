import { Prisma } from "@/generated/prisma";

import { prisma } from "@/core/database/prisma";
import { ConflictError, NotFoundError } from "@/lib/errors/app-error";

import {
  SITE_LIST_LIMIT,
  sitePageSchema,
  type CreateSiteBody,
  type ListSitesQuery,
  type SitePageInput,
  type UpdateSiteBody,
} from "./schema";

export type SitePageDto = {
  id: string;
  title: string;
  path: string;
  content: string;
};

export type SiteDto = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  pages: SitePageDto[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function normalizePages(pages: SitePageInput[]): SitePageDto[] {
  return pages.map((page) => ({
    id: page.id ?? crypto.randomUUID(),
    title: page.title,
    path: page.path,
    content: page.content,
  }));
}

function parsePages(value: Prisma.JsonValue): SitePageDto[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    const parsed = sitePageSchema.safeParse(item);
    return parsed.success ? [normalizePages([parsed.data])[0]] : [];
  });
}

function serialize(record: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  pages: Prisma.JsonValue;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): SiteDto {
  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    description: record.description,
    status: record.status,
    pages: parsePages(record.pages),
    publishedAt: record.publishedAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function isUniqueViolation(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function listUserSites(userId: string, query: ListSitesQuery) {
  const records = await prisma.site.findMany({
    where: {
      userId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.q ? { name: { contains: query.q, mode: "insensitive" } } : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: query.limit ?? SITE_LIST_LIMIT,
  });

  return records.map(serialize);
}

export async function createUserSite(userId: string, body: CreateSiteBody) {
  try {
    const record = await prisma.site.create({
      data: {
        userId,
        name: body.name,
        slug: body.slug,
        description: body.description,
        pages: normalizePages(body.pages) as unknown as Prisma.InputJsonValue,
      },
    });

    return serialize(record);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError({ message: "You already have a site with this slug." });
    }

    throw error;
  }
}

export async function updateUserSite(userId: string, id: string, body: UpdateSiteBody) {
  const existing = await prisma.site.findFirst({ where: { id, userId } });

  if (!existing) {
    throw new NotFoundError("Site");
  }

  try {
    const record = await prisma.site.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.slug !== undefined ? { slug: body.slug } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.pages !== undefined
          ? { pages: normalizePages(body.pages) as unknown as Prisma.InputJsonValue }
          : {}),
        ...(body.status !== undefined
          ? {
              status: body.status,
              publishedAt:
                body.status === "published" ? (existing.publishedAt ?? new Date()) : existing.publishedAt,
            }
          : {}),
      },
    });

    return serialize(record);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError({ message: "You already have a site with this slug." });
    }

    throw error;
  }
}

export async function deleteUserSite(userId: string, id: string) {
  const existing = await prisma.site.findFirst({ where: { id, userId } });

  if (!existing) {
    throw new NotFoundError("Site");
  }

  await prisma.site.delete({ where: { id } });
}

export async function getPublishedSite(id: string) {
  const record = await prisma.site.findFirst({
    where: { id, status: "published" },
  });

  if (!record) {
    throw new NotFoundError("Site");
  }

  return serialize(record);
}
