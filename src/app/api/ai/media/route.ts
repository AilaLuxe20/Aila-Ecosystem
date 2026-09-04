import {
  aiDocumentRateLimiter,
  aiFailure,
  ailaModeQuerySchema,
  type AiErrorCode,
} from "@/core/ai/chat-api";
import {
  deleteIntelligenceDocument,
  processIntelligenceUpload,
} from "@/core/ai/intelligence/files";
import { AilaAuthenticationError } from "@/core/auth/clerk-user";
import { MAX_INTELLIGENCE_ATTACHMENTS } from "@/core/constants";
import { assertModeEntitlement } from "@/lib/auth/require-product-access";
import {
  AuthenticationError,
  AuthorizationError,
  ERROR_CODES,
} from "@/lib/errors/app-error";
import { createLogger } from "@/lib/logger/logger";

const log = createLogger("api.ai.media");

export const runtime = "nodejs";
export const maxDuration = 60;

function jsonFailure(
  status: number,
  code: AiErrorCode,
  message: string,
  rateLimit?: Parameters<typeof aiFailure>[3],
) {
  return aiFailure(status, code, message, rateLimit);
}

function authFailure(error: unknown) {
  if (error instanceof AilaAuthenticationError || error instanceof AuthenticationError) {
    return jsonFailure(401, ERROR_CODES.UNAUTHENTICATED, "Authentication required.");
  }

  if (error instanceof AuthorizationError) {
    return jsonFailure(403, ERROR_CODES.FORBIDDEN, error.message);
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const modeValue = formData.get("mode");
    const modeParsed = ailaModeQuerySchema.safeParse(
      typeof modeValue === "string" && modeValue.trim() ? modeValue.trim() : "intelligence",
    );

    if (!modeParsed.success) {
      return jsonFailure(400, ERROR_CODES.VALIDATION_FAILED, "Unknown Aila workspace.");
    }

    const user = await assertModeEntitlement(modeParsed.data);
    const rateLimit = await aiDocumentRateLimiter.check(`ai:media:${user.id}`);

    if (!rateLimit.allowed) {
      return jsonFailure(
        429,
        ERROR_CODES.RATE_LIMITED,
        "Too many file uploads. Please try again shortly.",
        { rateLimit },
      );
    }

    const files = formData.getAll("file").filter((value) => value instanceof File);

    if (files.length === 0) {
      return jsonFailure(400, ERROR_CODES.VALIDATION_FAILED, "Please attach a file.", {
        rateLimit,
      });
    }

    if (files.length > MAX_INTELLIGENCE_ATTACHMENTS) {
      return jsonFailure(
        400,
        ERROR_CODES.VALIDATION_FAILED,
        "Only one file can be attached per request.",
        { rateLimit },
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
      mode: modeParsed.data,
    });

    if (!result.ok) {
      log.info("media rejected", {
        userId: user.id,
        code: result.code,
        mode: modeParsed.data,
      });

      return jsonFailure(result.status, result.code, result.message, { rateLimit });
    }

    log.info("media stored", {
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
      },
    );
  } catch (error) {
    const denied = authFailure(error);
    if (denied) return denied;

    log.error("media unexpected error", error, {});

    return jsonFailure(500, ERROR_CODES.INTERNAL_ERROR, "Aila could not process this file.");
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const modeParsed = ailaModeQuerySchema.safeParse(searchParams.get("mode") ?? "intelligence");
    if (!modeParsed.success) {
      return jsonFailure(400, ERROR_CODES.VALIDATION_FAILED, "Unknown Aila workspace.");
    }

    const user = await assertModeEntitlement(modeParsed.data);
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return jsonFailure(400, ERROR_CODES.VALIDATION_FAILED, "documentId is required.");
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
    const denied = authFailure(error);
    if (denied) return denied;

    log.error("media delete unexpected error", error, {});

    return jsonFailure(500, ERROR_CODES.INTERNAL_ERROR, "Aila could not remove this file.");
  }
}
