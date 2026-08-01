import { NextResponse } from "next/server";
<<<<<<< HEAD
<<<<<<< HEAD
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
=======

import {
  saveConversation,
} from "@/core/ai/conversation";
=======
import { saveConversation } from "@/core/ai/conversation";
>>>>>>> 6d08bcd (Apply Cline and agent changes to main worktree)

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
<<<<<<< HEAD

>>>>>>> 914997d (fix: restore AI conversation and session modules)
=======
>>>>>>> 6d08bcd (Apply Cline and agent changes to main worktree)
