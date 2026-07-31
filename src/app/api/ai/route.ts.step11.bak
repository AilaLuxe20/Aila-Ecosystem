import { NextResponse } from "next/server";
import type { ChatMessage, AilaMode } from "@/core/types";
import { orchestrate } from "@/core/ai/orchestrator";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const mode: AilaMode = body?.mode ?? "intelligence";
    const messages: ChatMessage[] = body?.messages ?? [];
    const documentText: string | undefined = body?.documentText;
    const documentName: string | undefined = body?.documentName;

    const result = await orchestrate({
      mode,
      messages,
      documentText,
      documentName,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Aila Intelligence could not respond." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reply: result.reply,
    });
  } catch (error) {
    console.error("Aila AI API Error:", error);
    return NextResponse.json(
      { error: "Aila Intelligence encountered an unexpected error." },
      { status: 500 }
    );
  }
}


