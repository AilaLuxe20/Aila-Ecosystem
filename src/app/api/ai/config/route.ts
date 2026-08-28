import { NextResponse } from "next/server";
import { AI_MODEL } from "@/core/constants";

export async function GET() {
  return NextResponse.json({
    success: true,
    provider: "OpenRouter",
    model: AI_MODEL,
    streaming: false,
    orchestrator: true,
    version: "1.0.0",
  });
}
