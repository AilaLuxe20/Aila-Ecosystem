import { NextResponse } from "next/server";
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

export async function POST(req: Request) {
  const body = await req.json();

  const conversations = body.conversations ?? [];

  for (const conversation of conversations) {
    saveConversation(conversation);
  }

  return NextResponse.json({
    success: true,
    imported: conversations.length,
  });
}

>>>>>>> 914997d (fix: restore AI conversation and session modules)
