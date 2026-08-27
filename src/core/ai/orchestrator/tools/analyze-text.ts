import { z } from "zod";

import { ERROR_CODES } from "@/lib/errors/app-error";

import type { IntelligenceTool, ToolResult } from "./contract";

export const analyzeTextInputSchema = z
  .object({
    text: z.string().trim().min(1).max(14000).optional(),
    fileName: z.string().trim().max(255).optional(),
  })
  .strict();

const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "that",
  "the",
  "to",
  "with",
]);

export type AnalyzeTextData = {
  fileName: string;
  characters: number;
  words: number;
  sentences: number;
  headings: string[];
  topTerms: { term: string; count: number }[];
  excerpt: string;
};

function analyze(text: string, fileName: string): AnalyzeTextData {
  const words = text
    .toLowerCase()
    .match(/[a-z0-9']+/g)
    ?.filter((word) => word.length > 1 && !STOPWORDS.has(word)) ?? [];

  const counts = new Map<string, number>();
  for (const word of words) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  const topTerms = [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 8)
    .map(([term, count]) => ({ term, count }));

  const headings = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^#{1,6}\s+\S/.test(line) || /^[A-Z][A-Za-z0-9 /-]{3,80}$/.test(line))
    .slice(0, 12);

  const sentences = text.split(/[.!?]+/).filter((part) => part.trim().length > 0);

  return {
    fileName,
    characters: text.length,
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    sentences: sentences.length,
    headings,
    topTerms,
    excerpt: text.slice(0, 280),
  };
}

export const analyzeTextTool: IntelligenceTool<
  typeof analyzeTextInputSchema,
  AnalyzeTextData
> = {
  name: "analyze_text",
  description:
    "Analyze supplied text or the currently attached document. Returns structure counts, headings, and frequent terms. Does not run legal document review.",
  auth: "authenticated",
  allowedModes: ["intelligence"],
  inputSchema: analyzeTextInputSchema,
  parameters: {
    type: "object",
    additionalProperties: false,
    properties: {
      text: {
        type: "string",
        description: "Plain text to analyze. Optional when document context is already attached.",
      },
      fileName: {
        type: "string",
        description: "Optional label for the text source.",
      },
    },
  },
  async execute(input, context): Promise<ToolResult<AnalyzeTextData>> {
    const text = (input.text ?? context.documentText ?? "").trim();
    const fileName =
      input.fileName?.trim() || context.documentName || "supplied text";

    if (!text) {
      return {
        ok: false,
        error: {
          code: ERROR_CODES.VALIDATION_FAILED,
          message: "No text was provided to analyze.",
        },
      };
    }

    return {
      ok: true,
      data: analyze(text.slice(0, 14000), fileName),
    };
  },
};
