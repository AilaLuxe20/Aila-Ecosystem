import { NextResponse } from "next/server";
import { z } from "zod";

import {
  MAX_INTELLIGENCE_ATTACHMENTS,
  MAX_MESSAGE_LENGTH,
  MAX_MESSAGES,
} from "@/core/constants";
import { config } from "@/core/config";
import type { AilaMode, ChatMessage } from "@/core/types";
import { ERROR_CODES, type ErrorCode } from "@/lib/errors/app-error";
import {
  MemoryRateLimiter,
  rateLimitHeaders,
  type RateLimitResult,
} from "@/lib/api/rate-limit";

/**
 * Shared request validation and safe HTTP envelopes for POST /api/ai.
 *
 * Kept next to the AI engine (not a second HTTP framework) so the chat route
 * stays thin while every Intelligence response uses one contract.
 */

export const AILA_MODE_VALUES = [
  "intelligence",
  "legal",
  "business",
  "automation",
  "ads",
  "apps",
  "calendar",
  "commerce",
  "flow",
  "sites",
] as const satisfies readonly AilaMode[];

export const ailaModeQuerySchema = z.enum(AILA_MODE_VALUES);

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(MAX_MESSAGE_LENGTH),
});

export const aiChatRequestSchema = z
  .object({
    mode: z.enum(AILA_MODE_VALUES).optional().default("intelligence"),
    conversationId: z.string().trim().min(1).max(128).nullish(),
    sessionId: z.string().trim().min(1).max(128).nullish(),
    messages: z
      .array(chatMessageSchema)
      .max(MAX_MESSAGES + 5)
      .optional()
      .default([]),
    documentText: z
      .string()
      .max(config.documents.maxTextLength)
      .nullish(),
    documentName: z.string().trim().max(255).nullish(),
    documentIds: z
      .array(z.string().trim().min(1).max(128))
      .max(MAX_INTELLIGENCE_ATTACHMENTS)
      .optional(),
  })
  .strict();

export type AiChatRequest = z.infer<typeof aiChatRequestSchema>;

export type AiErrorCode =
  | typeof ERROR_CODES.VALIDATION_FAILED
  | typeof ERROR_CODES.UNAUTHENTICATED
  | typeof ERROR_CODES.FORBIDDEN
  | typeof ERROR_CODES.NOT_FOUND
  | typeof ERROR_CODES.CONFLICT
  | typeof ERROR_CODES.RATE_LIMITED
  | typeof ERROR_CODES.TIMEOUT
  | typeof ERROR_CODES.EXTERNAL_SERVICE_ERROR
  | typeof ERROR_CODES.CONFIGURATION_ERROR
  | typeof ERROR_CODES.INTERNAL_ERROR;

export type AiSuccessBody = {
  success: true;
  conversationId: string;
  sessionId: string;
  reply: string;
};

export type AiFailureBody = {
  success: false;
  error: {
    code: AiErrorCode | ErrorCode;
    message: string;
  };
};

/** Process-local limiter for AI chat. Keyed by authenticated Prisma user id. */
export const aiChatRateLimiter = new MemoryRateLimiter({
  limit: 30,
  windowMs: 60_000,
});

/** Process-local limiter for Intelligence file uploads. */
export const aiDocumentRateLimiter = new MemoryRateLimiter({
  limit: 10,
  windowMs: 60_000,
});

export function resolveConversationId(
  body: AiChatRequest
): string | undefined {
  return body.conversationId ?? body.sessionId ?? undefined;
}

/**
 * Extracts the latest user turn. Client history is not trusted for model
 * context — only this message is combined with server-side history.
 */
export function extractLatestUserMessage(
  messages: AiChatRequest["messages"]
): ChatMessage | null {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.role !== "user") {
      continue;
    }

    const content = message.content.trim();

    if (!content || content.length > MAX_MESSAGE_LENGTH) {
      continue;
    }

    return {
      role: "user",
      content,
    };
  }

  return null;
}

export function aiSuccess(
  payload: Omit<AiSuccessBody, "success">,
  init?: { headers?: HeadersInit }
): NextResponse<AiSuccessBody> {
  return NextResponse.json(
    {
      success: true,
      ...payload,
    },
    { status: 200, headers: init?.headers }
  );
}

export function aiFailure(
  status: number,
  code: AiErrorCode,
  message: string,
  init?: { headers?: HeadersInit; rateLimit?: RateLimitResult }
): NextResponse<AiFailureBody> {
  const headers = new Headers(init?.headers);

  if (init?.rateLimit) {
    for (const [key, value] of Object.entries(
      rateLimitHeaders(init.rateLimit)
    )) {
      headers.set(key, value);
    }
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
      },
    },
    { status, headers }
  );
}

export const AI_STREAM_CONTENT_TYPE = "text/event-stream; charset=utf-8";

export type AiStreamEvent =
  | { type: "delta"; content: string }
  | {
      type: "done";
      conversationId: string;
      sessionId: string;
      reply: string;
    }
  | {
      type: "error";
      error: {
        code: AiErrorCode | ErrorCode;
        message: string;
      };
    };

export function aiStreamResponse(
  stream: ReadableStream<Uint8Array>,
  rateLimit: RateLimitResult
): Response {
  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": AI_STREAM_CONTENT_TYPE,
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      ...rateLimitHeaders(rateLimit),
    },
  });
}
