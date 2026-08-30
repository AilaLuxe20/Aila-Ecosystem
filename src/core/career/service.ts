import { prisma } from "@/core/database/prisma";
import { NotFoundError } from "@/lib/errors/app-error";

import {
  CAREER_LIST_LIMIT,
  type CreateCareerApplicationBody,
  type CreateCareerResumeBody,
  type ListCareerQuery,
  type UpdateCareerApplicationBody,
  type UpdateCareerResumeBody,
} from "./schema";

export type CareerResumeDto = {
  id: string;
  title: string;
  summary: string;
  experience: string;
  skills: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type CareerApplicationDto = {
  id: string;
  company: string;
  role: string;
  status: string;
  notes: string | null;
  appliedAt: string | null;
  interviewAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function serializeResume(record: {
  id: string;
  title: string;
  summary: string;
  experience: string;
  skills: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): CareerResumeDto {
  return {
    id: record.id,
    title: record.title,
    summary: record.summary,
    experience: record.experience,
    skills: record.skills,
    status: record.status,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function serializeApplication(record: {
  id: string;
  company: string;
  role: string;
  status: string;
  notes: string | null;
  appliedAt: Date | null;
  interviewAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): CareerApplicationDto {
  return {
    id: record.id,
    company: record.company,
    role: record.role,
    status: record.status,
    notes: record.notes,
    appliedAt: record.appliedAt?.toISOString() ?? null,
    interviewAt: record.interviewAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export async function listCareerResumes(userId: string, query: ListCareerQuery) {
  const records = await prisma.careerResume.findMany({
    where: {
      userId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: "insensitive" } },
              { summary: { contains: query.q, mode: "insensitive" } },
              { skills: { contains: query.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: query.limit ?? CAREER_LIST_LIMIT,
  });

  return records.map(serializeResume);
}

export async function createCareerResume(userId: string, body: CreateCareerResumeBody) {
  return serializeResume(
    await prisma.careerResume.create({
      data: {
        userId,
        title: body.title,
        summary: body.summary,
        experience: body.experience,
        skills: body.skills,
        status: body.status,
      },
    }),
  );
}

export async function updateCareerResume(userId: string, id: string, body: UpdateCareerResumeBody) {
  const existing = await prisma.careerResume.findFirst({ where: { id, userId } });
  if (!existing) {
    throw new NotFoundError("Resume");
  }

  return serializeResume(
    await prisma.careerResume.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.summary !== undefined ? { summary: body.summary } : {}),
        ...(body.experience !== undefined ? { experience: body.experience } : {}),
        ...(body.skills !== undefined ? { skills: body.skills } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
      },
    }),
  );
}

export async function deleteCareerResume(userId: string, id: string) {
  const existing = await prisma.careerResume.findFirst({ where: { id, userId } });
  if (!existing) {
    throw new NotFoundError("Resume");
  }
  await prisma.careerResume.delete({ where: { id } });
}

export async function listCareerApplications(userId: string, query: ListCareerQuery) {
  const records = await prisma.careerApplication.findMany({
    where: {
      userId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.q
        ? {
            OR: [
              { company: { contains: query.q, mode: "insensitive" } },
              { role: { contains: query.q, mode: "insensitive" } },
              { notes: { contains: query.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: query.limit ?? CAREER_LIST_LIMIT,
  });

  return records.map(serializeApplication);
}

export async function createCareerApplication(userId: string, body: CreateCareerApplicationBody) {
  return serializeApplication(
    await prisma.careerApplication.create({
      data: {
        userId,
        company: body.company,
        role: body.role,
        status: body.status,
        notes: body.notes,
        appliedAt: body.appliedAt ? new Date(body.appliedAt) : null,
        interviewAt: body.interviewAt ? new Date(body.interviewAt) : null,
      },
    }),
  );
}

export async function updateCareerApplication(
  userId: string,
  id: string,
  body: UpdateCareerApplicationBody,
) {
  const existing = await prisma.careerApplication.findFirst({ where: { id, userId } });
  if (!existing) {
    throw new NotFoundError("Application");
  }

  return serializeApplication(
    await prisma.careerApplication.update({
      where: { id },
      data: {
        ...(body.company !== undefined ? { company: body.company } : {}),
        ...(body.role !== undefined ? { role: body.role } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(body.notes !== undefined ? { notes: body.notes } : {}),
        ...(body.appliedAt !== undefined
          ? { appliedAt: body.appliedAt ? new Date(body.appliedAt) : null }
          : {}),
        ...(body.interviewAt !== undefined
          ? { interviewAt: body.interviewAt ? new Date(body.interviewAt) : null }
          : {}),
      },
    }),
  );
}

export function formatCareerAiContext(
  resumes: CareerResumeDto[],
  applications: CareerApplicationDto[],
): string {
  return [
    "AILA CAREER SNAPSHOT",
    `Resumes: ${
      resumes.length
        ? resumes.map((resume) => `${resume.title} (${resume.status})`).join("; ")
        : "none"
    }`,
    `Applications: ${
      applications.length
        ? applications
            .map((application) => `${application.role} at ${application.company} (${application.status})`)
            .join("; ")
        : "none"
    }`,
  ].join("\n");
}

export async function deleteCareerApplication(userId: string, id: string) {
  const existing = await prisma.careerApplication.findFirst({ where: { id, userId } });
  if (!existing) {
    throw new NotFoundError("Application");
  }
  await prisma.careerApplication.delete({ where: { id } });
}
