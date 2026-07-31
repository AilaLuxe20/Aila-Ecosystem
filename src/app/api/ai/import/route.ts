import { NextResponse } from "next/server";

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

