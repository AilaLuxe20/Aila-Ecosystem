import { NextResponse } from "next/server";
<<<<<<< HEAD
<<<<<<< HEAD
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

=======

import {
  listConversations,
} from "@/core/ai/conversation";
=======
import { listConversations } from "@/core/ai/conversation";
>>>>>>> 6d08bcd (Apply Cline and agent changes to main worktree)

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

<<<<<<< HEAD
  return NextResponse.json({
    success: true,
    conversations,
  });
>>>>>>> 914997d (fix: restore AI conversation and session modules)
=======
>>>>>>> 6d08bcd (Apply Cline and agent changes to main worktree)
}
