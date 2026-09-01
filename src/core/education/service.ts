import { prisma } from "@/core/database/prisma";
import { NotFoundError } from "@/lib/errors/app-error";

import {
  EDUCATION_LIST_LIMIT,
  type CreateEducationCourseBody,
  type CreateEducationNoteBody,
  type CreateEducationQuizBody,
  type ListEducationQuery,
  type UpdateEducationCourseBody,
  type UpdateEducationNoteBody,
  type UpdateEducationQuizBody,
} from "./schema";

export type EducationCourseDto = {
  id: string;
  title: string;
  topic: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type EducationNoteDto = {
  id: string;
  courseId: string | null;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type EducationQuizDto = {
  id: string;
  courseId: string;
  question: string;
  answer: string;
  userAnswer: string | null;
  correct: boolean | null;
  answeredAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export function gradeQuizAnswer(expected: string, submitted: string): boolean {
  return expected.trim().toLowerCase() === submitted.trim().toLowerCase();
}

function serializeCourse(record: {
  id: string;
  title: string;
  topic: string;
  description: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): EducationCourseDto {
  return {
    id: record.id,
    title: record.title,
    topic: record.topic,
    description: record.description,
    status: record.status,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function serializeNote(record: {
  id: string;
  courseId: string | null;
  title: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}): EducationNoteDto {
  return {
    id: record.id,
    courseId: record.courseId,
    title: record.title,
    body: record.body,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function serializeQuiz(record: {
  id: string;
  courseId: string;
  question: string;
  answer: string;
  userAnswer: string | null;
  correct: boolean | null;
  answeredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): EducationQuizDto {
  return {
    id: record.id,
    courseId: record.courseId,
    question: record.question,
    answer: record.answer,
    userAnswer: record.userAnswer,
    correct: record.correct,
    answeredAt: record.answeredAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

async function requireOwnedCourse(userId: string, courseId: string) {
  const course = await prisma.educationCourse.findFirst({ where: { id: courseId, userId } });
  if (!course) {
    throw new NotFoundError("Course");
  }
  return course;
}

export async function listEducationCourses(userId: string, query: ListEducationQuery) {
  const records = await prisma.educationCourse.findMany({
    where: {
      userId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: "insensitive" } },
              { topic: { contains: query.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: query.limit ?? EDUCATION_LIST_LIMIT,
  });

  return records.map(serializeCourse);
}

export async function createEducationCourse(userId: string, body: CreateEducationCourseBody) {
  return serializeCourse(
    await prisma.educationCourse.create({
      data: {
        userId,
        title: body.title,
        topic: body.topic,
        description: body.description,
        status: body.status,
      },
    }),
  );
}

export async function updateEducationCourse(
  userId: string,
  id: string,
  body: UpdateEducationCourseBody,
) {
  await requireOwnedCourse(userId, id);

  return serializeCourse(
    await prisma.educationCourse.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.topic !== undefined ? { topic: body.topic } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
      },
    }),
  );
}

export async function deleteEducationCourse(userId: string, id: string) {
  await requireOwnedCourse(userId, id);
  await prisma.educationCourse.delete({ where: { id } });
}

export async function listEducationNotes(userId: string, query: ListEducationQuery) {
  const records = await prisma.educationNote.findMany({
    where: {
      userId,
      ...(query.courseId ? { courseId: query.courseId } : {}),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: "insensitive" } },
              { body: { contains: query.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: query.limit ?? EDUCATION_LIST_LIMIT,
  });

  return records.map(serializeNote);
}

export async function createEducationNote(userId: string, body: CreateEducationNoteBody) {
  if (body.courseId) {
    await requireOwnedCourse(userId, body.courseId);
  }

  return serializeNote(
    await prisma.educationNote.create({
      data: {
        userId,
        courseId: body.courseId,
        title: body.title,
        body: body.body,
      },
    }),
  );
}

export async function updateEducationNote(userId: string, id: string, body: UpdateEducationNoteBody) {
  const existing = await prisma.educationNote.findFirst({ where: { id, userId } });
  if (!existing) {
    throw new NotFoundError("Note");
  }

  if (body.courseId) {
    await requireOwnedCourse(userId, body.courseId);
  }

  return serializeNote(
    await prisma.educationNote.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.body !== undefined ? { body: body.body } : {}),
        ...(body.courseId !== undefined ? { courseId: body.courseId } : {}),
      },
    }),
  );
}

export async function deleteEducationNote(userId: string, id: string) {
  const existing = await prisma.educationNote.findFirst({ where: { id, userId } });
  if (!existing) {
    throw new NotFoundError("Note");
  }
  await prisma.educationNote.delete({ where: { id } });
}

export async function listEducationQuizzes(userId: string, query: ListEducationQuery) {
  const records = await prisma.educationQuiz.findMany({
    where: {
      userId,
      ...(query.courseId ? { courseId: query.courseId } : {}),
    },
    orderBy: { createdAt: "asc" },
    take: query.limit ?? EDUCATION_LIST_LIMIT,
  });

  return records.map(serializeQuiz);
}

export async function createEducationQuiz(userId: string, body: CreateEducationQuizBody) {
  await requireOwnedCourse(userId, body.courseId);

  return serializeQuiz(
    await prisma.educationQuiz.create({
      data: {
        userId,
        courseId: body.courseId,
        question: body.question,
        answer: body.answer,
      },
    }),
  );
}

export async function updateEducationQuiz(userId: string, id: string, body: UpdateEducationQuizBody) {
  const existing = await prisma.educationQuiz.findFirst({ where: { id, userId } });
  if (!existing) {
    throw new NotFoundError("Quiz");
  }

  const nextAnswer = body.answer ?? existing.answer;
  const submitted = body.userAnswer;

  return serializeQuiz(
    await prisma.educationQuiz.update({
      where: { id },
      data: {
        ...(body.question !== undefined ? { question: body.question } : {}),
        ...(body.answer !== undefined ? { answer: body.answer } : {}),
        ...(submitted !== undefined
          ? {
              userAnswer: submitted,
              correct: gradeQuizAnswer(nextAnswer, submitted),
              answeredAt: new Date(),
            }
          : {}),
      },
    }),
  );
}

export function formatEducationAiContext(
  courses: EducationCourseDto[],
  notes: EducationNoteDto[],
  quizzes: EducationQuizDto[],
): string {
  const answered = quizzes.filter((quiz) => quiz.correct !== null);
  const correct = answered.filter((quiz) => quiz.correct).length;
  return [
    "AILA EDUCATION SNAPSHOT",
    `Courses: ${
      courses.length
        ? courses.map((course) => `${course.title} / ${course.topic} (${course.status})`).join("; ")
        : "none"
    }`,
    `Notes: ${notes.length}`,
    `Quizzes: ${quizzes.length}${answered.length ? `, ${correct}/${answered.length} correct` : ""}`,
  ].join("\n");
}

export async function deleteEducationQuiz(userId: string, id: string) {
  const existing = await prisma.educationQuiz.findFirst({ where: { id, userId } });
  if (!existing) {
    throw new NotFoundError("Quiz");
  }
  await prisma.educationQuiz.delete({ where: { id } });
}
