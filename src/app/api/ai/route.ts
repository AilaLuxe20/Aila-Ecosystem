import { orchestrate } from "@/core/ai/orchestrator";
import {
  aiChatRateLimiter,
  aiChatRequestSchema,
  aiFailure,
  aiSuccess,
  extractLatestUserMessage,
  resolveConversationId,
} from "@/core/ai/chat-api";
import {
  appendConversationMessages,
  createUserConversation,
  getUserConversation,
} from "@/core/ai/conversation/service";
import {
  AilaAuthenticationError,
  requirePrismaUser,
} from "@/core/auth/clerk-user";
import type { ChatMessage } from "@/core/types";
import { ERROR_CODES } from "@/lib/errors/app-error";
import { createLogger } from "@/lib/logger/logger";

const log = createLogger("api.ai.chat");

export async function POST(req: Request) {
  try {
    const user = await requirePrismaUser();

    const rateLimit = await aiChatRateLimiter.check(`ai:chat:${user.id}`);

    if (!rateLimit.allowed) {
      log.warn("AI chat rate limit exceeded", {
        userId: user.id,
        retryAfterSeconds: rateLimit.retryAfterSeconds,
      });

      return aiFailure(
        429,
        ERROR_CODES.RATE_LIMITED,
        "Too many requests. Please try again shortly.",
        { rateLimit }
      );
    }

    let rawBody: unknown;

    try {
      rawBody = await req.json();
    } catch {
      return aiFailure(
        400,
        ERROR_CODES.VALIDATION_FAILED,
        "Request body must be valid JSON."
      );
    }

    const parsed = aiChatRequestSchema.safeParse(rawBody);

    if (!parsed.success) {
      log.info("AI chat validation failed", {
        userId: user.id,
        issueCount: parsed.error.issues.length,
      });

      return aiFailure(
        400,
        ERROR_CODES.VALIDATION_FAILED,
        "Invalid chat request."
      );
    }

    const body = parsed.data;
    const mode = body.mode;
    const conversationId = resolveConversationId(body);
    const latestUserMessage = extractLatestUserMessage(body.messages);

    if (!latestUserMessage) {
      return aiFailure(
        400,
        ERROR_CODES.VALIDATION_FAILED,
        "Please send Aila a message."
      );
    }

    /*
     * Existing threads: load + ownership/mode checks only.
     * Brand-new threads: do not create a DB row until OpenRouter succeeds.
     */
    let existingConversation: Awaited<
      ReturnType<typeof getUserConversation>
    > = null;

    if (conversationId) {
      existingConversation = await getUserConversation(
        user.id,
        conversationId
      );

      if (!existingConversation) {
        return aiFailure(
          404,
          ERROR_CODES.NOT_FOUND,
          "Conversation not found."
        );
      }

      if (existingConversation.mode !== mode) {
        return aiFailure(
          409,
          ERROR_CODES.CONFLICT,
          "This conversation belongs to a different Aila workspace."
        );
      }
    }

    const history = existingConversation?.messages ?? [];

    // Server history only — never trust client-provided prior turns.
    const conversationMessages = [...history, latestUserMessage];

    const result = await orchestrate({
      mode,
      messages: conversationMessages,
      conversationId: existingConversation?.id,
      sessionId: existingConversation?.id,
      documentText: body.documentText ?? undefined,
      documentName: body.documentName ?? undefined,
    });

    if (!result.success) {
      log.error("AI chat orchestration failed", undefined, {
        userId: user.id,
        conversationId: existingConversation?.id,
        mode,
        isNewConversation: !existingConversation,
      });

      return aiFailure(
        502,
        ERROR_CODES.EXTERNAL_SERVICE_ERROR,
        "Aila Intelligence could not respond right now."
      );
    }

    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: result.reply,
    };

    const conversation =
      existingConversation ??
      (await createUserConversation(
        user.id,
        mode,
        latestUserMessage
      ));

    await appendConversationMessages(conversation.id, [
      latestUserMessage,
      assistantMessage,
    ]);

    return aiSuccess(
      {
        conversationId: conversation.id,
        sessionId: conversation.id,
        reply: result.reply,
      },
      {
        headers: {
          "RateLimit-Limit": String(rateLimit.limit),
          "RateLimit-Remaining": String(rateLimit.remaining),
          "RateLimit-Reset": String(Math.ceil(rateLimit.resetAt / 1000)),
        },
      }
    );
  } catch (error) {
    if (error instanceof AilaAuthenticationError) {
      return aiFailure(
        401,
        ERROR_CODES.UNAUTHENTICATED,
        "Authentication required."
      );
    }

    log.error("AI chat unexpected error", error, {});

    return aiFailure(
      500,
      ERROR_CODES.INTERNAL_ERROR,
      "Aila Intelligence encountered an unexpected error."
    );
  }
}
