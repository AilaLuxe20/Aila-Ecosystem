import {
  aiDocumentRateLimiter,
  aiFailure,
  type AiErrorCode,
} from "@/core/ai/chat-api";
import {
  deleteIntelligenceDocument,
  processIntelligenceUpload,
} from "@/core/ai/intelligence/files";
import {
  AilaAuthenticationError,
  requirePrismaUser,
} from "@/core/auth/clerk-user";
import { MAX_INTELLIGENCE_ATTACHMENTS } from "@/core/constants";
import { ERROR_CODES } from "@/lib/errors/app-error";
import { createLogger } from "@/lib/logger/logger";

const log = createLogger("api.ai.intelligence.document");

export const runtime = "nodejs";
export const maxDuration = 30;

function jsonFailure(
  status: number,
  code: AiErrorCode,
  message: string,
  rateLimit?: Parameters<typeof aiFailure>[3]
) {
  return aiFailure(status, code, message, rateLimit);
}

export async function POST(req: Request) {
  try {
    const user = await requirePrismaUser();
    const rateLimit = await aiDocumentRateLimiter.check(
      `ai:document:${user.id}`
    );

    if (!rateLimit.allowed) {
      return jsonFailure(
        429,
        ERROR_CODES.RATE_LIMITED,
        "Too many file uploads. Please try again shortly.",
        { rateLimit }
      );
    }

    const formData = await req.formData();
    const files = formData.getAll("file").filter((value) => value instanceof File);

    if (files.length === 0) {
      return jsonFailure(
        400,
        ERROR_CODES.VALIDATION_FAILED,
        "Please attach a file.",
        { rateLimit }
      );
    }

    if (files.length > MAX_INTELLIGENCE_ATTACHMENTS) {
      return jsonFailure(
        400,
        ERROR_CODES.VALIDATION_FAILED,
        "Only one file can be attached per request.",
        { rateLimit }
      );
    }

    const uploaded = files[0];
    const conversationValue = formData.get("conversationId");
    const conversationId =
      typeof conversationValue === "string" && conversationValue.trim()
        ? conversationValue.trim()
        : undefined;

    const bytes = new Uint8Array(await uploaded.arrayBuffer());

    const result = await processIntelligenceUpload({
      userId: user.id,
      fileName: uploaded.name,
      fileSize: uploaded.size,
      bytes,
      conversationId,
    });

    if (!result.ok) {
      log.info("intelligence document rejected", {
        userId: user.id,
        code: result.code,
      });

      return jsonFailure(result.status, result.code, result.message, {
        rateLimit,
      });
    }

    log.info("intelligence document stored", {
      userId: user.id,
      documentId: result.document.id,
      fileName: result.document.fileName,
      kind: result.document.kind,
      fileSize: result.document.fileSize,
      truncated: result.document.truncated,
      extractedCharCount: result.document.extractedCharCount,
    });

    return Response.json(
      {
        success: true,
        document: result.document,
      },
      {
        status: 200,
        headers: {
          "RateLimit-Limit": String(rateLimit.limit),
          "RateLimit-Remaining": String(rateLimit.remaining),
        },
      }
    );
  } catch (error) {
    if (error instanceof AilaAuthenticationError) {
      return jsonFailure(401, ERROR_CODES.UNAUTHENTICATED, "Authentication required.");
    }

    log.error("intelligence document unexpected error", error, {});

    return jsonFailure(
      500,
      ERROR_CODES.INTERNAL_ERROR,
      "Aila could not process this file."
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requirePrismaUser();
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return jsonFailure(
        400,
        ERROR_CODES.VALIDATION_FAILED,
        "documentId is required."
      );
    }

    const deleted = await deleteIntelligenceDocument({
      userId: user.id,
      documentId,
    });

    if (!deleted) {
      return jsonFailure(404, ERROR_CODES.NOT_FOUND, "Document not found.");
    }

    return Response.json({ success: true, deleted: true });
  } catch (error) {
    if (error instanceof AilaAuthenticationError) {
      return jsonFailure(401, ERROR_CODES.UNAUTHENTICATED, "Authentication required.");
    }

    log.error("intelligence document delete unexpected error", error, {});

    return jsonFailure(
      500,
      ERROR_CODES.INTERNAL_ERROR,
      "Aila could not remove this file."
    );
  }
}
