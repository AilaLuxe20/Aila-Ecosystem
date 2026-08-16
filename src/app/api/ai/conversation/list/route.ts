import { NextResponse } from "next/server";
import { AilaAuthenticationError, requirePrismaUser } from "@/core/auth/clerk-user";
import { listUserConversations } from "@/core/ai/conversation/service";

export async function GET() {
  try {
    const user = await requirePrismaUser();

    return NextResponse.json({
      success: true,
      conversations: await listUserConversations(user.id),
    });
  } catch (error) {
    if (error instanceof AilaAuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    console.error("Aila Conversation List Error:", error);
    return NextResponse.json(
      { error: "Unable to load conversations." },
      { status: 500 }
    );
  }
}
