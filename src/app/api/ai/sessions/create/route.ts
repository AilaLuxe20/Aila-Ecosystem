import { NextResponse } from "next/server";
import { AilaAuthenticationError, requirePrismaUser } from "@/core/auth/clerk-user";
import { ensureUserConversation } from "@/core/ai/conversation/service";
import type { AilaMode } from "@/core/types";

export async function POST(req:Request){
    try {
        const user = await requirePrismaUser();
        const body = await req.json().catch(() => ({}));
        const mode: AilaMode = body?.mode ?? "intelligence";

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
            success:true,
            sessionId: conversation.id,
            conversationId: conversation.id
        });
    } catch (error) {
        if (error instanceof AilaAuthenticationError) {
            return NextResponse.json({ error: error.message }, { status: 401 });
        }

        console.error("Aila Session Create Error:", error);
        return NextResponse.json(
            { error: "Unable to create the conversation." },
            { status: 500 }
        );
    }

}
