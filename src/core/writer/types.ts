export type WriterCharacterDto = {
  id: string;
  bookId: string;
  name: string;
  role: string;
  bio: string;
  appearance: string;
  motivation: string;
  relationships: string;
  notes: string;
  updatedAt: string;
};

export type WriterChapterDto = {
  id: string;
  bookId: string;
  position: number;
  title: string;
  summary: string;
  scenePlan: string;
  body: string;
  status: string;
  updatedAt: string;
};

export type WriterBookSummaryDto = {
  id: string;
  title: string;
  genre: string;
  status: string;
  premise: string;
  chapterCount: number;
  characterCount: number;
  updatedAt: string;
};

export type WriterBookDetailDto = WriterBookSummaryDto & {
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
  characters: WriterCharacterDto[];
  chapters: WriterChapterDto[];
};
