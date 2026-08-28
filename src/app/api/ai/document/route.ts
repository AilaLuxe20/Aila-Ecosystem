import { NextResponse } from "next/server";

import { analyzeDocument } from "@/core/ai/engine";
import { processDocument } from "@/core/ai/documentEngine";
import { aiDocumentRateLimiter } from "@/core/ai/chat-api";
import { saveLegalDocument } from "@/core/legal/service";
import { assertProductEntitlement } from "@/lib/auth/require-product-access";
import {
  AuthenticationError,
  AuthorizationError,
  ERROR_CODES,
} from "@/lib/errors/app-error";
import { createLogger } from "@/lib/logger/logger";

export const runtime = "nodejs";
export const maxDuration = 30;

const log = createLogger("api.ai.document");

export async function POST(req: Request) {
  try {
    const user = await assertProductEntitlement("ailalegal");
    const rateLimit = await aiDocumentRateLimiter.check(`ai:legal-document:${user.id}`);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { message: "Too many file uploads. Please try again shortly." },
        { status: 429 },
      );
    }

    const formData = await req.formData();
    const uploadedFile = formData.get("file");

    if (!(uploadedFile instanceof File)) {
      return NextResponse.json(
        { message: "No document uploaded." },
        { status: 400 },
      );
    }

    const document = await processDocument(uploadedFile);
    const analysis = await analyzeDocument(document.text, document.fileName, "legal");

    if (!analysis.success) {
      return NextResponse.json(
        { message: analysis.error || "Document analysis failed." },
        { status: 502 },
      );
    }

    const stored = await saveLegalDocument({
      userId: user.id,
      fileName: document.fileName,
      fileSize: document.size,
      mimeType: document.type,
      fileType: document.fileName.toLowerCase().endsWith(".pdf") ? "pdf" : "txt",
      content: document.text,
      summary: analysis.reply,
    });

    return NextResponse.json({
      success: true,
      message: analysis.reply,
      document: {
        id: stored.id,
        name: stored.fileName,
        size: stored.fileSize,
        type: stored.mimeType,
      },
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { message: "Sign in to analyze a document." },
        { status: 401 },
      );
    }

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { message: error.message },
        { status: 403 },
      );
    }

    log.error("Legal document analysis failed.", error, {
      code: ERROR_CODES.INTERNAL_ERROR,
    });

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Document analysis failed.",
      },
      { status: 500 },
    );
  }
}
