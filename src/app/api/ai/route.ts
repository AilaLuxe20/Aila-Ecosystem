import { NextResponse } from "next/server";
import type { ChatMessage, AilaMode } from "@/core/types";
import { orchestrate } from "@/core/ai/orchestrator";
import {
  AilaAuthenticationError,
  requirePrismaUser,
} from "@/core/auth/clerk-user";
import {
  appendConversationMessages,
  ensureUserConversation,
  getUserConversationMessages,
} from "@/core/ai/conversation/service";

const AILA_MODES = new Set<AilaMode>([
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
]);

function resolveMode(value: unknown): AilaMode {
  return typeof value === "string" && AILA_MODES.has(value as AilaMode)
    ? (value as AilaMode)
    : "intelligence";
}

export async function POST(req: Request) {
  try {
    const user = await requirePrismaUser();
    const body = await req.json();

    const mode = resolveMode(body?.mode);
    const messages: ChatMessage[] = Array.isArray(body?.messages)
      ? body.messages
      : [];

    const conversationId: string | undefined =
      typeof body?.conversationId === "string"
        ? body.conversationId
        : typeof body?.sessionId === "string"
          ? body.sessionId
          : undefined;

    const documentText: string | undefined =
      typeof body?.documentText === "string"
        ? body.documentText
        : undefined;

    const documentName: string | undefined =
      typeof body?.documentName === "string"
        ? body.documentName
        : undefined;

    const latestUserMessage = [...messages]
      .reverse()
      .find(
        (message) =>
          message?.role === "user" &&
          typeof message.content === "string" &&
          message.content.trim()
      );

    if (!latestUserMessage) {
      return NextResponse.json(
        {
          success: false,
          error: "Please send Aila a message.",
        },
        { status: 400 }
      );
    }

    const conversation = await ensureUserConversation({
      userId: user.id,
      conversationId,
      mode,
      firstMessage: latestUserMessage,
    });

    if (!conversation) {
      return NextResponse.json(
        {
          success: false,
          error: "Conversation not found.",
        },
        { status: 404 }
      );
    }

    /*
     * A conversation belongs permanently to the mode in which it
     * was created. Do not allow a client to reuse an Intelligence
     * conversation as Legal, Business, etc.
     */
    if (conversation.mode !== mode) {
      return NextResponse.json(
        {
          success: false,
          error: "This conversation belongs to a different Aila workspace.",
        },
        { status: 409 }
      );
    }

    const history = conversationId
      ? await getUserConversationMessages(user.id, conversation.id)
      : [];

    if (history === null) {
      return NextResponse.json(
        {
          success: false,
          error: "Conversation not found.",
        },
        { status: 404 }
      );
    }

    const conversationMessages = [...history, latestUserMessage];

    const result = await orchestrate({
      mode,
      messages: conversationMessages,
      conversationId: conversation.id,
      sessionId: conversation.id,
      documentText,
      documentName,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error ?? "Aila Intelligence could not respond.",
        },
        { status: 500 }
      );
    }

    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: result.reply,
    };

    await appendConversationMessages(conversation.id, [
      latestUserMessage,
      assistantMessage,
    ]);

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      sessionId: conversation.id,
      reply: result.reply,
    });
  } catch (error) {
    if (error instanceof AilaAuthenticationError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 401 }
      );
    }

    console.error("Aila AI API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Aila Intelligence encountered an unexpected error.",
      },
      { status: 500 }
    );
  }
}
