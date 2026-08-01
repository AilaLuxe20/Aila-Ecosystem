import { NextResponse } from "next/server";
import { saveConversation } from "@/core/ai/conversation";

export async function POST(req: Request) {

    const { conversations = [] } = await req.json();

    for (const conversation of conversations) {

        saveConversation(
            conversation.id,
            conversation.messages ?? []
        );

    }

    return NextResponse.json({
        success: true,
        imported: conversations.length
    });

}
