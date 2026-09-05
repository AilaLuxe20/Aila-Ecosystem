import { orchestrateStream } from "@/core/ai/orchestrator";
import {
  aiChatRateLimiter,
  aiChatRequestSchema,
  aiFailure,
  aiStreamResponse,
  extractLatestUserMessage,
  modeAllowsChatAttachments,
  normalizeAiChatRequestInput,
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
import { assertModeEntitlement } from "@/lib/auth/require-product-access";
import { AuthorizationError, ERROR_CODES } from "@/lib/errors/app-error";
import type { ChatMessage } from "@/core/types";
import {
  attachIntelligenceDocuments,
  buildIntelligenceChatContext,
  formatDocumentPromptBlock,
  resolveIntelligenceDocuments,
} from "@/core/ai/intelligence/files";
import { formatDailyAiContext, getDailyWorkspace } from "@/core/daily/service";
import { isValidTimeZone } from "@/core/daily/timezone";
import { formatCareerAiContext, listCareerApplications, listCareerResumes } from "@/core/career/service";
import { formatCodingAiContext, listCodingProjects } from "@/core/coding/service";
import { formatDocumentsAiContext, listLibraryDocuments } from "@/core/documents/service";
import {
  formatEducationAiContext,
  listEducationCourses,
  listEducationNotes,
  listEducationQuizzes,
} from "@/core/education/service";
import { formatFinanceAiContext, getFinanceWorkspace } from "@/core/finance/service";
import { formatHealthAiContext, listHealthHabits, listHealthLogs } from "@/core/health/service";
import { formatShippingAiContext, listShippingShipments } from "@/core/shipping/service";
import { formatTranslateAiContext, listTranslateEntries } from "@/core/translate/service";
import { formatTravelAiContext, listTravelTrips } from "@/core/travel/service";
import { formatWriterWorkspaceContext } from "@/core/writer/books";
import { getLatestLegalDocumentContext } from "@/core/legal/service";
import {
  encodeSseData,
  isAbortError,
  runStreamingChatSession,
  type AilaChatStreamEvent,
} from "@/core/ai/streaming";
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

    const parsed = aiChatRequestSchema.safeParse(
      normalizeAiChatRequestInput(rawBody)
    );

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      log.info("AI chat validation failed", {
        userId: user.id,
        issueCount: parsed.error.issues.length,
        issuePath: firstIssue?.path.map(String).join(".") || "",
        issueCode: firstIssue?.code,
      });

      return aiFailure(
        400,
        ERROR_CODES.VALIDATION_FAILED,
        "Invalid chat request."
      );
    }

    const body = parsed.data;
    const mode = body.mode;
    await assertModeEntitlement(mode);
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

    // Client document bodies are never trusted. Only server-loaded extracts.
    let documentText: string | undefined;
    let documentName: string | undefined;
    let documentKind: string | undefined;
    let documentToolText: string | undefined;
    let intelligenceDocumentIds: string[] = [];
    let workspaceContext: string | undefined;

    if (modeAllowsChatAttachments(mode)) {
      const resolvedDocuments = await resolveIntelligenceDocuments({
        userId: user.id,
        conversationId: existingConversation?.id,
        documentIds: body.documentIds,
      });

      if (!resolvedDocuments.ok) {
        return aiFailure(
          resolvedDocuments.status,
          resolvedDocuments.code,
          resolvedDocuments.message,
          { rateLimit }
        );
      }

      const intelligenceContext = buildIntelligenceChatContext({
        records: resolvedDocuments.records,
        query: latestUserMessage.content,
      });

      if (intelligenceContext) {
        documentText = formatDocumentPromptBlock(intelligenceContext);
        documentName = intelligenceContext.fileName;
        documentKind = intelligenceContext.kind;
        documentToolText = intelligenceContext.toolText;
        intelligenceDocumentIds = resolvedDocuments.records.map(
          (record) => record.id
        );
      }
    }

    if (mode === "legal" && !documentText) {
      const latestLegal = await getLatestLegalDocumentContext(user.id);
      if (latestLegal) {
        documentText = latestLegal.text;
        documentName = latestLegal.fileName;
      }
    }

    if (mode === "daily") {
      const timezone =
        body.timezone && isValidTimeZone(body.timezone) ? body.timezone : "UTC";
      const workspace = await getDailyWorkspace(user.id, timezone);
      workspaceContext = formatDailyAiContext(workspace);
    }

    if (mode === "health") {
      const [habits, logs] = await Promise.all([
        listHealthHabits(user.id),
        listHealthLogs(user.id),
      ]);
      workspaceContext = formatHealthAiContext(habits, logs);
    }

    if (mode === "finance") {
      workspaceContext = formatFinanceAiContext(await getFinanceWorkspace(user.id));
    }

    if (mode === "travel") {
      workspaceContext = formatTravelAiContext(await listTravelTrips(user.id));
    }

    if (mode === "shipping") {
      workspaceContext = formatShippingAiContext(await listShippingShipments(user.id));
    }

    if (mode === "writer") {
      workspaceContext = await formatWriterWorkspaceContext(user.id, body.bookId);
    }

    if (mode === "translate") {
      workspaceContext = formatTranslateAiContext(await listTranslateEntries(user.id, {}));
    }

    if (mode === "documents") {
      workspaceContext = formatDocumentsAiContext(await listLibraryDocuments(user.id, {}));
    }

    if (mode === "coding") {
      workspaceContext = formatCodingAiContext(await listCodingProjects(user.id, {}));
    }

    if (mode === "career") {
      const [resumes, applications] = await Promise.all([
        listCareerResumes(user.id, {}),
        listCareerApplications(user.id, {}),
      ]);
      workspaceContext = formatCareerAiContext(resumes, applications);
    }

    if (mode === "education") {
      const [courses, notes, quizzes] = await Promise.all([
        listEducationCourses(user.id, {}),
        listEducationNotes(user.id, {}),
        listEducationQuizzes(user.id, {}),
      ]);
      workspaceContext = formatEducationAiContext(courses, notes, quizzes);
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const emit = (event: AilaChatStreamEvent) => {
          // Deltas are live UI only. `done` is the commit notification and
          // must still be written if the client aborted during persist.
          if (req.signal.aborted && event.type !== "done") {
            return;
          }

          try {
            controller.enqueue(encoder.encode(encodeSseData(event)));
          } catch {
            // Stream already cancelled; the client will reconcile from DB.
          }
        };

        try {
          await runStreamingChatSession({
            signal: req.signal,
            emit,
            generate: orchestrateStream(
              {
                mode,
                messages: conversationMessages,
                conversationId: existingConversation?.id,
                sessionId: existingConversation?.id,
                documentText,
                documentName,
                documentKind,
                documentToolText,
                userId: user.id,
                workspaceContext,
              },
              { signal: req.signal }
            ),
            persist: async (reply) => {
              /*
               * Persist once after a completed, non-empty generation.
               * Cancelled or partial streams are not written: the Message
               * model has no cancelled flag, so a partial assistant turn
               * would look like a finished reply.
               */
              const assistantMessage: ChatMessage = {
                role: "assistant",
                content: reply,
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

              if (
                modeAllowsChatAttachments(mode) &&
                intelligenceDocumentIds.length > 0
              ) {
                await attachIntelligenceDocuments({
                  userId: user.id,
                  conversationId: conversation.id,
                  documentIds: intelligenceDocumentIds,
                });
              }

              return {
                conversationId: conversation.id,
                sessionId: conversation.id,
              };
            },
          });
        } catch (error) {
          if (isAbortError(error) || req.signal.aborted) {
            return;
          }

          log.error("AI chat stream unexpected error", error, {
            userId: user.id,
            conversationId: existingConversation?.id,
            mode,
          });

          emit({
            type: "error",
            error: {
              code: ERROR_CODES.INTERNAL_ERROR,
              message:
                "Aila Intelligence encountered an unexpected error.",
            },
          });
        } finally {
          try {
            controller.close();
          } catch {
            // Stream may already be closed after client abort.
          }
        }
      },
    });

    return aiStreamResponse(stream, rateLimit);
  } catch (error) {
    if (error instanceof AilaAuthenticationError) {
      return aiFailure(
        401,
        ERROR_CODES.UNAUTHENTICATED,
        "Authentication required."
      );
    }

    if (error instanceof AuthorizationError) {
      return aiFailure(403, ERROR_CODES.FORBIDDEN, error.message);
    }

    log.error("AI chat unexpected error", error, {});

    return aiFailure(
      500,
      ERROR_CODES.INTERNAL_ERROR,
      "Aila Intelligence encountered an unexpected error."
    );
  }
}
