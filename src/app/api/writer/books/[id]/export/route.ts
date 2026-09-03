import {
  createProductRateLimiters,
  parseJsonBody,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { writerIdSchema } from "@/core/writer/schema";
import { exportWriterBookMarkdown, getWriterBook } from "@/core/writer/books";
import { NextResponse } from "next/server";

import { sanitizeFileName } from "@/lib/utils/file";

const limits = createProductRateLimiters("writer-books");

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("writer");
    const rateLimit = await limits.enforceRead(user.id);
    const { id } = await context.params;
    const book = await getWriterBook(user.id, parseJsonBody(id, writerIdSchema));
    const markdown = exportWriterBookMarkdown(book);
    const fileName = sanitizeFileName(`${book.title || "manuscript"}.md`) || "manuscript.md";
    const response = new NextResponse(markdown, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
    return withRateLimitHeaders(response, rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
