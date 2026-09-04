import { prisma } from "@/core/database/prisma";
import { NotFoundError, ValidationError } from "@/lib/errors/app-error";

import { runProductChat } from "@/core/ai/product-chat";

import type {
  CreateWriterBookBody,
  CreateWriterChapterBody,
  CreateWriterCharacterBody,
  GenerateWriterBody,
  UpdateWriterBookBody,
  UpdateWriterChapterBody,
  UpdateWriterCharacterBody,
  WriterGenerateAction,
} from "./schema";
import type {
  WriterBookDetailDto,
  WriterBookSummaryDto,
  WriterChapterDto,
  WriterCharacterDto,
} from "./types";

export type {
  WriterBookDetailDto,
  WriterBookSummaryDto,
  WriterChapterDto,
  WriterCharacterDto,
} from "./types";

const BOOK_LIST_LIMIT = 60;
const CONTEXT_FIELD_LIMIT = 1_200;
const PROSE_FIELD_LIMIT = 3_500;

function clip(value: string, max: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max)}\n[truncated]`;
}

function serializeCharacter(record: {
  id: string;
  bookId: string;
  name: string;
  role: string;
  bio: string;
  appearance: string;
  motivation: string;
  relationships: string;
  notes: string;
  updatedAt: Date;
}): WriterCharacterDto {
  return {
    id: record.id,
    bookId: record.bookId,
    name: record.name,
    role: record.role,
    bio: record.bio,
    appearance: record.appearance,
    motivation: record.motivation,
    relationships: record.relationships,
    notes: record.notes,
    updatedAt: record.updatedAt.toISOString(),
  };
}

function serializeChapter(record: {
  id: string;
  bookId: string;
  position: number;
  title: string;
  summary: string;
  scenePlan: string;
  body: string;
  status: string;
  updatedAt: Date;
}): WriterChapterDto {
  return {
    id: record.id,
    bookId: record.bookId,
    position: record.position,
    title: record.title,
    summary: record.summary,
    scenePlan: record.scenePlan,
    body: record.body,
    status: record.status,
    updatedAt: record.updatedAt.toISOString(),
  };
}

function serializeBook(
  record: {
    id: string;
    title: string;
    premise: string;
    genre: string;
    themes: string;
    audience: string;
    tone: string;
    worldBible: string;
    storyBible: string;
    plot: string;
    outline: string;
    locations: string;
    timeline: string;
    continuityNotes: string;
    status: string;
    updatedAt: Date;
    characters: Parameters<typeof serializeCharacter>[0][];
    chapters: Parameters<typeof serializeChapter>[0][];
  },
  options: { includeManuscript?: boolean } = {},
): WriterBookDetailDto {
  const includeManuscript = options.includeManuscript ?? true;
  return {
    id: record.id,
    title: record.title,
    genre: record.genre,
    status: record.status,
    premise: record.premise,
    chapterCount: record.chapters.length,
    characterCount: record.characters.length,
    updatedAt: record.updatedAt.toISOString(),
    themes: record.themes,
    audience: record.audience,
    tone: record.tone,
    worldBible: record.worldBible,
    storyBible: record.storyBible,
    plot: record.plot,
    outline: record.outline,
    locations: record.locations,
    timeline: record.timeline,
    continuityNotes: record.continuityNotes,
    characters: record.characters.map(serializeCharacter),
    chapters: record.chapters.map((chapter) =>
      includeManuscript
        ? serializeChapter(chapter)
        : { ...serializeChapter(chapter), body: "" },
    ),
  };
}

const bookInclude = {
  characters: { orderBy: { updatedAt: "desc" as const } },
  chapters: { orderBy: { position: "asc" as const } },
};

async function loadOwnedBook(userId: string, bookId: string) {
  const book = await prisma.writerBook.findFirst({
    where: { id: bookId, userId },
    include: bookInclude,
  });
  if (!book) throw new NotFoundError("Book");
  return book;
}

export async function listWriterBooks(userId: string): Promise<WriterBookSummaryDto[]> {
  const books = await prisma.writerBook.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: BOOK_LIST_LIMIT,
    include: {
      _count: { select: { chapters: true, characters: true } },
    },
  });

  return books.map((book) => ({
    id: book.id,
    title: book.title,
    genre: book.genre,
    status: book.status,
    premise: book.premise,
    chapterCount: book._count.chapters,
    characterCount: book._count.characters,
    updatedAt: book.updatedAt.toISOString(),
  }));
}

export async function getWriterBook(userId: string, bookId: string): Promise<WriterBookDetailDto> {
  return serializeBook(await loadOwnedBook(userId, bookId));
}

export async function createWriterBook(userId: string, body: CreateWriterBookBody) {
  const book = await prisma.writerBook.create({
    data: {
      userId,
      title: body.title,
      premise: body.premise,
      genre: body.genre,
    },
    include: bookInclude,
  });
  return serializeBook(book);
}

export async function updateWriterBook(
  userId: string,
  bookId: string,
  body: UpdateWriterBookBody,
) {
  await loadOwnedBook(userId, bookId);
  const book = await prisma.writerBook.update({
    where: { id: bookId },
    data: body,
    include: bookInclude,
  });
  return serializeBook(book);
}

export async function deleteWriterBook(userId: string, bookId: string) {
  await loadOwnedBook(userId, bookId);
  await prisma.writerBook.delete({ where: { id: bookId } });
}

export async function createWriterCharacter(
  userId: string,
  bookId: string,
  body: CreateWriterCharacterBody,
) {
  await loadOwnedBook(userId, bookId);
  const character = await prisma.writerCharacter.create({
    data: {
      userId,
      bookId,
      name: body.name,
      role: body.role,
      bio: body.bio,
    },
  });
  return serializeCharacter(character);
}

export async function updateWriterCharacter(
  userId: string,
  characterId: string,
  body: UpdateWriterCharacterBody,
) {
  const existing = await prisma.writerCharacter.findFirst({
    where: { id: characterId, userId },
  });
  if (!existing) throw new NotFoundError("Character");
  return serializeCharacter(
    await prisma.writerCharacter.update({ where: { id: characterId }, data: body }),
  );
}

export async function deleteWriterCharacter(userId: string, characterId: string) {
  const existing = await prisma.writerCharacter.findFirst({
    where: { id: characterId, userId },
  });
  if (!existing) throw new NotFoundError("Character");
  await prisma.writerCharacter.delete({ where: { id: characterId } });
}

export async function createWriterChapter(
  userId: string,
  bookId: string,
  body: CreateWriterChapterBody,
) {
  await loadOwnedBook(userId, bookId);
  const last = await prisma.writerChapter.findFirst({
    where: { bookId, userId },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  const chapter = await prisma.writerChapter.create({
    data: {
      userId,
      bookId,
      title: body.title,
      summary: body.summary,
      position: (last?.position ?? 0) + 1,
    },
  });
  return serializeChapter(chapter);
}

export async function updateWriterChapter(
  userId: string,
  chapterId: string,
  body: UpdateWriterChapterBody,
) {
  const existing = await prisma.writerChapter.findFirst({
    where: { id: chapterId, userId },
  });
  if (!existing) throw new NotFoundError("Chapter");
  return serializeChapter(
    await prisma.writerChapter.update({ where: { id: chapterId }, data: body }),
  );
}

export async function deleteWriterChapter(userId: string, chapterId: string) {
  const existing = await prisma.writerChapter.findFirst({
    where: { id: chapterId, userId },
  });
  if (!existing) throw new NotFoundError("Chapter");
  await prisma.writerChapter.delete({ where: { id: chapterId } });
}

export function formatWriterBookContext(book: WriterBookDetailDto): string {
  const characters = book.characters
    .slice(0, 20)
    .map(
      (character) =>
        `${character.name}${character.role ? ` (${character.role})` : ""}: ${clip(character.bio || character.motivation, 280)}`,
    )
    .join("\n");
  const chapters = book.chapters
    .map(
      (chapter) =>
        `Ch ${chapter.position} ${chapter.title} [${chapter.status}] ${clip(chapter.summary, 180)} (${chapter.body.length} chars drafted)`,
    )
    .join("\n");

  return [
    `BOOK: ${book.title}`,
    `Status: ${book.status}. Genre: ${book.genre || "unspecified"}. Tone: ${book.tone || "unspecified"}. Audience: ${book.audience || "unspecified"}.`,
    book.themes ? `Themes: ${clip(book.themes, CONTEXT_FIELD_LIMIT)}` : "",
    book.premise ? `Premise:\n${clip(book.premise, CONTEXT_FIELD_LIMIT)}` : "",
    book.worldBible ? `World/setting:\n${clip(book.worldBible, CONTEXT_FIELD_LIMIT)}` : "",
    book.storyBible ? `Story bible:\n${clip(book.storyBible, CONTEXT_FIELD_LIMIT)}` : "",
    book.plot ? `Plot:\n${clip(book.plot, CONTEXT_FIELD_LIMIT)}` : "",
    book.outline ? `Outline:\n${clip(book.outline, CONTEXT_FIELD_LIMIT)}` : "",
    book.locations ? `Locations:\n${clip(book.locations, CONTEXT_FIELD_LIMIT)}` : "",
    book.timeline ? `Timeline:\n${clip(book.timeline, CONTEXT_FIELD_LIMIT)}` : "",
    characters ? `Characters:\n${characters}` : "Characters: none yet.",
    chapters ? `Chapters:\n${chapters}` : "Chapters: none yet.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export async function formatWriterWorkspaceContext(
  userId: string,
  bookId?: string | null,
): Promise<string> {
  const books = await listWriterBooks(userId);
  if (books.length === 0) {
    return "AILA WRITER SNAPSHOT\nNo book projects yet.";
  }

  const selected =
    (bookId ? books.find((entry) => entry.id === bookId) : undefined) ?? books[0];
  const detail = await getWriterBook(userId, selected.id);
  return [
    "AILA WRITER SNAPSHOT",
    `Projects: ${books.map((book) => `${book.title} (${book.status}, ${book.chapterCount} ch)`).join("; ")}`,
    bookId ? "Open book:" : "Most recently edited book:",
    formatWriterBookContext(detail),
  ].join("\n\n");
}

export function exportWriterBookMarkdown(book: WriterBookDetailDto): string {
  const characterBlock = book.characters
    .map(
      (character) =>
        `### ${character.name}\nRole: ${character.role || "—"}\n\n${character.bio}\n\nMotivation: ${character.motivation}\nRelationships: ${character.relationships}`,
    )
    .join("\n\n");

  const manuscript = book.chapters
    .map((chapter) => `## Chapter ${chapter.position}. ${chapter.title}\n\n${chapter.body || chapter.summary}`)
    .join("\n\n");

  return [
    `# ${book.title}`,
    book.genre ? `Genre: ${book.genre}` : "",
    book.premise ? `## Premise\n\n${book.premise}` : "",
    book.storyBible ? `## Story bible\n\n${book.storyBible}` : "",
    book.worldBible ? `## World\n\n${book.worldBible}` : "",
    characterBlock ? `## Characters\n\n${characterBlock}` : "",
    book.outline ? `## Outline\n\n${book.outline}` : "",
    manuscript ? `## Manuscript\n\n${manuscript}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function parseOutlineChapters(text: string): Array<{ title: string; summary: string }> {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start < 0 || end <= start) return [];

  try {
    const parsed: unknown = JSON.parse(text.slice(start, end + 1));
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const title = (item as { title?: unknown }).title;
        const summary = (item as { summary?: unknown }).summary;
        if (typeof title !== "string" || !title.trim()) return null;
        return {
          title: title.trim().slice(0, 160),
          summary: typeof summary === "string" ? summary.trim().slice(0, 8_000) : "",
        };
      })
      .filter((item): item is { title: string; summary: string } => item !== null)
      .slice(0, 40);
  } catch {
    return [];
  }
}

function requireChapter(book: WriterBookDetailDto, chapterId?: string): WriterChapterDto {
  if (!chapterId) {
    throw new ValidationError({ chapterId: "Select a chapter first." });
  }
  const chapter = book.chapters.find((item) => item.id === chapterId);
  if (!chapter) throw new NotFoundError("Chapter");
  return chapter;
}

function requireCharacter(book: WriterBookDetailDto, characterId?: string): WriterCharacterDto {
  if (!characterId) {
    throw new ValidationError({ characterId: "Select a character first." });
  }
  const character = book.characters.find((item) => item.id === characterId);
  if (!character) throw new NotFoundError("Character");
  return character;
}

function actionPrompt(
  action: WriterGenerateAction,
  _book: WriterBookDetailDto,
  options: {
    chapter?: WriterChapterDto;
    character?: WriterCharacterDto;
    instruction?: string;
  },
): { prompt: string; persist: "book" | "chapter" | "character" | "continuity" } {
  const extra = options.instruction ? `Writer instruction: ${options.instruction}` : "";
  const chapter = options.chapter;
  const character = options.character;

  switch (action) {
    case "develop_concept":
      return {
        persist: "book",
        prompt: `Develop the concept for this book. Return markdown with sections titled Premise, Genre, Themes, Audience, and Tone. Be specific to the user's idea. ${extra}`,
      };
    case "develop_world":
      return {
        persist: "book",
        prompt: `Write or expand the world/setting bible. Cover places, rules, atmosphere, and what already happened. Return only the world bible. ${extra}`,
      };
    case "develop_bible":
      return {
        persist: "book",
        prompt: `Write or expand the story bible: established facts, secrets, conflicts, and continuity rules. Return only the story bible. ${extra}`,
      };
    case "develop_plot":
      return {
        persist: "book",
        prompt: `Write a plot that fits this book. Cover beginning, escalating conflict, midpoint, climax, and resolution without flattening character. Return only the plot. ${extra}`,
      };
    case "develop_outline":
      return {
        persist: "book",
        prompt: `Create a chapter outline. First write a readable outline. Then on a new line output a JSON array of objects with keys title and summary, one object per chapter, no commentary inside the JSON. ${extra}`,
      };
    case "develop_character":
      return {
        persist: "character",
        prompt: `Develop this character in this book: ${character?.name}. Current bio:\n${clip(character?.bio ?? "", PROSE_FIELD_LIMIT)}\n\nReturn markdown with sections Bio, Appearance, Motivation, and Relationships. Keep established facts. ${extra}`,
      };
    case "plan_chapter":
      return {
        persist: "chapter",
        prompt: `Plan the next scene for Chapter ${chapter?.position}: ${chapter?.title}. Current summary:\n${clip(chapter?.summary ?? "", 1_500)}\nCurrent scene plan:\n${clip(chapter?.scenePlan ?? "", 1_500)}\n\nReturn markdown with sections Summary and Scene plan. ${extra}`,
      };
    case "generate_scene":
      return {
        persist: "chapter",
        prompt: `Write the next scene for Chapter ${chapter?.position}: ${chapter?.title}.
Chapter summary: ${clip(chapter?.summary ?? "", 800)}
Scene plan: ${clip(chapter?.scenePlan ?? "", 800)}
Existing chapter draft (continue from here; do not restart the book):\n${clip(chapter?.body ?? "", PROSE_FIELD_LIMIT)}

Write real scene prose with dialogue, action, setting, sensory detail, internal thought, conflict, and emotional movement. Return only the new scene, not a summary. ${extra}`,
      };
    case "continuity":
      return {
        persist: "continuity",
        prompt: `Check continuity for this book and the selected chapter. Flag contradictions in names, timeline, locations, relationships, and established facts. Return a markdown report only. ${extra}`,
      };
    default: {
      const verbs: Record<
        Extract<
          WriterGenerateAction,
          | "rewrite"
          | "expand"
          | "shorten"
          | "change_tone"
          | "improve_dialogue"
          | "improve_pacing"
          | "improve_description"
          | "grammar"
        >,
        string
      > = {
        rewrite: "Rewrite this chapter text more clearly while keeping events and voice.",
        expand: "Expand this chapter text with more concrete scene, not filler summary.",
        shorten: "Shorten this chapter text without dropping essential events or character.",
        change_tone: "Revise this chapter text to better match the book's stated tone.",
        improve_dialogue: "Revise this chapter to improve dialogue. Keep the same events.",
        improve_pacing: "Revise this chapter to improve pacing. Keep the same events.",
        improve_description: "Revise this chapter to improve description and sensory detail.",
        grammar: "Edit this chapter for grammar and clarity. Keep meaning and voice.",
      };
      return {
        persist: "chapter",
        prompt: `${verbs[action as keyof typeof verbs]}\n\nChapter ${chapter?.position}: ${chapter?.title}\n\n${clip(chapter?.body || chapter?.summary || "", PROSE_FIELD_LIMIT)}\n\nReturn only the revised chapter text. ${extra}`,
      };
    }
  }
}

function applyConceptSections(text: string): UpdateWriterBookBody {
  const section = (name: string) => {
    const match = text.match(
      new RegExp(`(?:^|\\n)##?\\s*${name}\\s*\\n([\\s\\S]*?)(?=\\n##?\\s|$)`, "i"),
    );
    return match?.[1]?.trim() ?? "";
  };
  return {
    premise: section("Premise") || text,
    genre: section("Genre").slice(0, 80) || undefined,
    themes: section("Themes") || undefined,
    audience: section("Audience").slice(0, 160) || undefined,
    tone: section("Tone").slice(0, 160) || undefined,
  };
}

function applyCharacterSections(text: string): UpdateWriterCharacterBody {
  const section = (name: string) => {
    const match = text.match(
      new RegExp(`(?:^|\\n)##?\\s*${name}\\s*\\n([\\s\\S]*?)(?=\\n##?\\s|$)`, "i"),
    );
    return match?.[1]?.trim();
  };
  return {
    bio: section("Bio") || text,
    appearance: section("Appearance"),
    motivation: section("Motivation"),
    relationships: section("Relationships"),
  };
}

export async function generateWriterContent(userId: string, body: GenerateWriterBody) {
  const book = await getWriterBook(userId, body.bookId);
  const chapter =
    body.action === "develop_character" ||
    body.action === "develop_concept" ||
    body.action === "develop_world" ||
    body.action === "develop_bible" ||
    body.action === "develop_plot" ||
    body.action === "develop_outline"
      ? undefined
      : requireChapter(book, body.chapterId);
  const character = body.action === "develop_character" ? requireCharacter(book, body.characterId) : undefined;

  if (
    (body.action === "rewrite" ||
      body.action === "expand" ||
      body.action === "shorten" ||
      body.action === "change_tone" ||
      body.action === "improve_dialogue" ||
      body.action === "improve_pacing" ||
      body.action === "improve_description" ||
      body.action === "grammar") &&
    !(chapter?.body ?? "").trim()
  ) {
    throw new ValidationError({
      chapterId: "This chapter has no draft to revise. Generate a scene first.",
    });
  }

  const { prompt, persist } = actionPrompt(body.action, book, {
    chapter,
    character,
    instruction: body.instruction,
  });

  const text = await runProductChat("writer", prompt, {
    workspaceContext: formatWriterBookContext(book),
  });

  if (persist === "continuity") {
    const updated = await updateWriterBook(userId, book.id, { continuityNotes: text });
    return { text, book: updated };
  }

  if (persist === "character" && character) {
    await updateWriterCharacter(userId, character.id, applyCharacterSections(text));
    return { text, book: await getWriterBook(userId, book.id) };
  }

  if (persist === "chapter" && chapter) {
    if (body.action === "plan_chapter") {
      const summaryMatch = text.match(/(?:^|\n)##?\s*Summary\s*\n([\s\S]*?)(?=\n##?\s|$)/i);
      const planMatch = text.match(/(?:^|\n)##?\s*Scene plan\s*\n([\s\S]*?)(?=\n##?\s|$)/i);
      await updateWriterChapter(userId, chapter.id, {
        summary: summaryMatch?.[1]?.trim() || chapter.summary,
        scenePlan: planMatch?.[1]?.trim() || text,
        status: "drafting",
      });
    } else if (body.action === "generate_scene") {
      const nextBody = chapter.body.trim() ? `${chapter.body.trim()}\n\n${text}` : text;
      await updateWriterChapter(userId, chapter.id, {
        body: nextBody,
        status: "drafting",
      });
    } else {
      await updateWriterChapter(userId, chapter.id, { body: text, status: "revised" });
    }
    return { text, book: await getWriterBook(userId, book.id) };
  }

  if (body.action === "develop_concept") {
    await updateWriterBook(userId, book.id, { ...applyConceptSections(text), status: "drafting" });
  } else if (body.action === "develop_world") {
    await updateWriterBook(userId, book.id, { worldBible: text });
  } else if (body.action === "develop_bible") {
    await updateWriterBook(userId, book.id, { storyBible: text });
  } else if (body.action === "develop_plot") {
    await updateWriterBook(userId, book.id, { plot: text });
  } else if (body.action === "develop_outline") {
    const parsed = parseOutlineChapters(text);
    await updateWriterBook(userId, book.id, { outline: text });
    if (parsed.length > 0 && book.chapters.length === 0) {
      for (const [index, item] of parsed.entries()) {
        await prisma.writerChapter.create({
          data: {
            userId,
            bookId: book.id,
            position: index + 1,
            title: item.title,
            summary: item.summary,
          },
        });
      }
    }
  }

  return { text, book: await getWriterBook(userId, book.id) };
}
