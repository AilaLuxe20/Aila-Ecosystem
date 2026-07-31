import { NextResponse } from "next/server";

import {
  clearConversations,
} from "@/core/ai/conversation";

export async function DELETE() {
  clearConversations();

  return NextResponse.json({
    success: true,
  });
}
