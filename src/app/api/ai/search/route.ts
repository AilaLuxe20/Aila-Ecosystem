import { NextResponse } from "next/server";

import { listConversations } from "@/core/ai/conversation";

export async function GET(req: Request) {

    const { searchParams } = new URL(req.url);

    const query = (searchParams.get("q") ?? "").toLowerCase();

    const conversations = listConversations().filter(
        (conversation) =>
            (conversation.title ?? "")
                .toLowerCase()
                .includes(query) ||
            conversation.messages.some(
                (message) =>
                    message.content.toLowerCase().includes(query)
            )
    );

    return NextResponse.json({
        success: true,
        conversations
    });

}
