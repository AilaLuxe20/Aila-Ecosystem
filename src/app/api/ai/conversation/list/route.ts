import { NextResponse } from "next/server";

import { ailaModeQuerySchema } from "@/core/ai/chat-api";
import { listUserConversations } from "@/core/ai/conversation/service";
import {
  AilaAuthenticationError,
  requirePrismaUser,
} from "@/core/auth/clerk-user";
import { ERROR_CODES } from "@/lib/errors/app-error";

export async function GET(req: Request) {
  try {
    const user = await requirePrismaUser();
    const { searchParams } = new URL(req.url);
    const modeParam = searchParams.get("mode");

    let mode: ReturnType<typeof ailaModeQuerySchema.parse> | undefined;

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
    }

    return NextResponse.json({
      success: true,
      conversations: await listUserConversations(user.id, mode),
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
