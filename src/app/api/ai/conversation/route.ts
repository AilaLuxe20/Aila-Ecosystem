import { NextResponse } from "next/server";

import { AILA_MODE_VALUES, ailaModeQuerySchema } from "@/core/ai/chat-api";
import {
  deleteUserConversation,
  ensureUserConversation,
  getUserConversation,
} from "@/core/ai/conversation/service";
import { AilaAuthenticationError, requirePrismaUser } from "@/core/auth/clerk-user";
import { assertModeEntitlement } from "@/lib/auth/require-product-access";
import type { AilaMode } from "@/core/types";
import { AuthorizationError, ERROR_CODES } from "@/lib/errors/app-error";

const AILA_MODES = new Set<AilaMode>(AILA_MODE_VALUES);

function resolveMode(value: unknown): AilaMode {
  return typeof value === "string" && AILA_MODES.has(value as AilaMode)
    ? (value as AilaMode)
    : "intelligence";
}

export async function GET(req: Request) {
  try {
    const user = await requirePrismaUser();
    const { searchParams } = new URL(req.url);
    const conversationId =
      searchParams.get("conversationId") ?? searchParams.get("id");
    const modeParam = searchParams.get("mode");

    if (!conversationId) {
      return NextResponse.json(
        {
          error: "conversationId is required.",
        },
        { status: 400 }
      );
    }

    let requestedMode: ReturnType<typeof ailaModeQuerySchema.parse> | undefined;

    if (modeParam) {
      const parsedMode = ailaModeQuerySchema.safeParse(modeParam);

      if (!parsedMode.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: ERROR_CODES.VALIDATION_FAILED,
              message: "Invalid conversation mode.",
            },
          },
          { status: 400 }
        );
      }

      requestedMode = parsedMode.data;
    }

    const conversation = await getUserConversation(user.id, conversationId);

    if (!conversation) {
      return NextResponse.json(
        {
          error: "Conversation not found.",
        },
        { status: 404 }
      );
    }

    if (requestedMode && conversation.mode !== requestedMode) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.CONFLICT,
            message: "This conversation belongs to a different Aila workspace.",
          },
        },
        { status: 409 }
      );
    }

    await assertModeEntitlement(conversation.mode as AilaMode);

    return NextResponse.json({
      success: true,
      conversation,
    });
  } catch (error) {
    if (error instanceof AilaAuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error("Aila Conversation API Error:", error);
    return NextResponse.json(
      { error: "Unable to load the conversation." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await requirePrismaUser();
    const body = await req.json().catch(() => ({}));
    const mode = resolveMode(body?.mode);
    await assertModeEntitlement(mode);

    const conversation = await ensureUserConversation({
      userId: user.id,
      mode,
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Unable to create the conversation." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      conversation: {
        id: conversation.id,
        mode: conversation.mode,
        title: conversation.title,
        createdAt: conversation.createdAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString(),
        messages: [],
      },
    });
  } catch (error) {
    if (error instanceof AilaAuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error("Aila Conversation Create Error:", error);
    return NextResponse.json(
      { error: "Unable to create the conversation." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requirePrismaUser();
    const { searchParams } = new URL(req.url);
    const conversationId =
      searchParams.get("conversationId") ?? searchParams.get("id");

    if (!conversationId) {
      return NextResponse.json(
        {
          error: "conversationId is required.",
        },
        { status: 400 }
      );
    }

    const conversation = await getUserConversation(user.id, conversationId);
    if (!conversation) {
      return NextResponse.json({
        success: true,
        deleted: false,
      });
    }

    await assertModeEntitlement(resolveMode(conversation.mode));
    const deleted = await deleteUserConversation(user.id, conversationId);

    return NextResponse.json({
      success: true,
      deleted,
    });
  } catch (error) {
    if (error instanceof AilaAuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error("Aila Conversation Delete Error:", error);
    return NextResponse.json(
      { error: "Unable to delete the conversation." },
      { status: 500 }
    );
  }
}
