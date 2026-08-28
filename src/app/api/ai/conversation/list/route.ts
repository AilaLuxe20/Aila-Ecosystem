import { NextResponse } from "next/server";

import { ailaModeQuerySchema } from "@/core/ai/chat-api";
import { listUserConversations } from "@/core/ai/conversation/service";
import {
  AilaAuthenticationError,
  requirePrismaUser,
} from "@/core/auth/clerk-user";
import { evaluateEntitlement, userHasActiveSubscription } from "@/core/billing/entitlements";
import { productKeyFromMode } from "@/core/products/catalog";
import type { AilaMode } from "@/core/types";
import { assertModeEntitlement, getActorRole } from "@/lib/auth/require-product-access";
import { AuthorizationError, ERROR_CODES } from "@/lib/errors/app-error";

export async function GET(req: Request) {
  try {
    const user = await requirePrismaUser();
    const role = (await getActorRole()) ?? "user";
    const { searchParams } = new URL(req.url);
    const modeParam = searchParams.get("mode");

    let mode: AilaMode | undefined;

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

      mode = parsedMode.data;
      await assertModeEntitlement(mode);
    }

    const conversations = await listUserConversations(user.id, mode);

    if (mode) {
      return NextResponse.json({
        success: true,
        conversations,
      });
    }

    const hasSub = await userHasActiveSubscription(user.id);
    const visible = conversations.filter((conversation) => {
      const parsed = ailaModeQuerySchema.safeParse(conversation.mode);
      if (!parsed.success) return false;
      return evaluateEntitlement(role, productKeyFromMode(parsed.data), hasSub).allowed;
    });

    return NextResponse.json({
      success: true,
      conversations: visible,
    });
  } catch (error) {
    if (error instanceof AilaAuthenticationError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.UNAUTHENTICATED,
            message: error.message,
          },
        },
        { status: 401 }
      );
    }

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.FORBIDDEN,
            message: error.message,
          },
        },
        { status: 403 }
      );
    }

    console.error("Aila Conversation List Error:", {
      name: error instanceof Error ? error.name : "UnknownError",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_ERROR,
          message: "Unable to load conversations.",
        },
      },
      { status: 500 }
    );
  }
}
