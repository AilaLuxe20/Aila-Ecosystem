import { Prisma } from "@/generated/prisma";

import { runProductChat } from "@/core/ai/product-chat";
import { prisma } from "@/core/database/prisma";
import { NotFoundError } from "@/lib/errors/app-error";

import {
  CODING_LIST_LIMIT,
  codingFileSchema,
  type CodingFileInput,
  type CreateCodingProjectBody,
  type ListCodingQuery,
  type UpdateCodingProjectBody,
} from "./schema";

export type CodingFileDto = {
  id: string;
  path: string;
  language: string;
  content: string;
};

export type CodingProjectDto = {
  id: string;
  name: string;
  description: string | null;
  language: string;
  files: CodingFileDto[];
  createdAt: string;
  updatedAt: string;
};

const STARTER_BY_LANGUAGE: Record<string, { path: string; content: string }> = {
  typescript: {
    path: "src/main.ts",
    content: 'export function main(): void {\n  console.log("Hello from Aila Coding");\n}\n',
  },
  javascript: {
    path: "src/main.js",
    content: 'function main() {\n  console.log("Hello from Aila Coding");\n}\n',
  },
  python: {
    path: "main.py",
    content: 'def main():\n    print("Hello from Aila Coding")\n\n\nif __name__ == "__main__":\n    main()\n',
  },
  go: {
    path: "main.go",
    content: 'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hello from Aila Coding")\n}\n',
  },
  rust: {
    path: "src/main.rs",
    content: 'fn main() {\n    println!("Hello from Aila Coding");\n}\n',
  },
  java: {
    path: "Main.java",
    content: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello from Aila Coding");\n  }\n}\n',
  },
  csharp: {
    path: "Program.cs",
    content: 'Console.WriteLine("Hello from Aila Coding");\n',
  },
  html: {
    path: "index.html",
    content:
      '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8" />\n    <title>Aila Coding</title>\n  </head>\n  <body>\n    <p>Hello from Aila Coding</p>\n  </body>\n</html>\n',
  },
  css: {
    path: "styles.css",
    content: "body {\n  font-family: system-ui, sans-serif;\n}\n",
  },
  json: {
    path: "data.json",
    content: '{\n  "hello": "Aila Coding"\n}\n',
  },
  markdown: {
    path: "README.md",
    content: "# Project\n\nCreated in Aila Coding.\n",
  },
  sql: {
    path: "schema.sql",
    content: "-- Aila Coding\nSELECT 1;\n",
  },
  other: {
    path: "main.txt",
    content: "",
  },
};

export function createStarterFile(language: string): CodingFileDto {
  const starter = STARTER_BY_LANGUAGE[language] ?? STARTER_BY_LANGUAGE.other;
  return {
    id: crypto.randomUUID(),
    path: starter.path,
    language,
    content: starter.content,
  };
}

function normalizeFiles(files: CodingFileInput[]): CodingFileDto[] {
  return files.map((file) => ({
    id: file.id ?? crypto.randomUUID(),
    path: file.path,
    language: file.language,
    content: file.content,
  }));
}

function parseFiles(value: Prisma.JsonValue): CodingFileDto[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    const parsed = codingFileSchema.safeParse(item);
    return parsed.success ? [normalizeFiles([parsed.data])[0]] : [];
  });
}

function serialize(record: {
  id: string;
  name: string;
  description: string | null;
  language: string;
  files: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}): CodingProjectDto {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    language: record.language,
    files: parseFiles(record.files),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

async function requireOwnedProject(userId: string, id: string) {
  const existing = await prisma.codingProject.findFirst({ where: { id, userId } });
  if (!existing) {
    throw new NotFoundError("Project");
  }
  return existing;
}

export async function listCodingProjects(userId: string, query: ListCodingQuery) {
  const records = await prisma.codingProject.findMany({
    where: {
      userId,
      ...(query.language ? { language: query.language } : {}),
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: "insensitive" } },
              { description: { contains: query.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: query.limit ?? CODING_LIST_LIMIT,
  });

  return records.map(serialize);
}

export function formatCodingAiContext(projects: CodingProjectDto[]): string {
  return [
    "AILA CODING SNAPSHOT",
    projects.length
      ? projects
          .slice(0, 8)
          .map(
            (project) =>
              `${project.name} (${project.language}, ${project.files.length} file${project.files.length === 1 ? "" : "s"})`,
          )
          .join("; ")
      : "No projects.",
  ].join("\n");
}

export async function getCodingProject(userId: string, id: string) {
  return serialize(await requireOwnedProject(userId, id));
}

export async function createCodingProject(userId: string, body: CreateCodingProjectBody) {
  return serialize(
    await prisma.codingProject.create({
      data: {
        userId,
        name: body.name,
        language: body.language,
        description: body.description,
        files: [createStarterFile(body.language)] as unknown as Prisma.InputJsonValue,
      },
    }),
  );
}

export async function updateCodingProject(
  userId: string,
  id: string,
  body: UpdateCodingProjectBody,
) {
  await requireOwnedProject(userId, id);

  return serialize(
    await prisma.codingProject.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.language !== undefined ? { language: body.language } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.files !== undefined
          ? { files: normalizeFiles(body.files) as unknown as Prisma.InputJsonValue }
          : {}),
      },
    }),
  );
}

export async function deleteCodingProject(userId: string, id: string) {
  await requireOwnedProject(userId, id);
  await prisma.codingProject.delete({ where: { id } });
}

export async function explainCodingFile(userId: string, id: string, fileId: string) {
  const project = serialize(await requireOwnedProject(userId, id));
  const file = project.files.find((item) => item.id === fileId);
  if (!file) {
    throw new NotFoundError("File");
  }

  return runProductChat(
    "coding",
    `Explain the following file from the project "${project.name}".\nPath: ${file.path}\nLanguage: ${file.language}\n\n${file.content || "(empty file)"}\n\nExplain what it does, call out risks, and suggest concrete improvements. Do not claim you executed the code.`,
  );
}
