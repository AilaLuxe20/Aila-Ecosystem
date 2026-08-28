import { NextResponse } from "next/server";
import { AilaAuthenticationError, requirePrismaUser } from "@/core/auth/clerk-user";
import { listUserConversations } from "@/core/ai/conversation/service";

export async function GET() {
  try {
    const user = await requirePrismaUser();
    const conversations = await listUserConversations(user.id);

    return NextResponse.json({
      success: true,
      sessions: conversations,
      conversations,
    });
  } catch (error) {
    if (error instanceof AilaAuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    console.error("Aila Sessions API Error:", error);
    return NextResponse.json(
      { error: "Unable to load conversations." },
      { status: 500 }
    );
  }
}
