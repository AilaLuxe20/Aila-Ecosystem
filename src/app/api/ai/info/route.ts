import { NextResponse } from "next/server";
import { AI_MODEL } from "@/core/constants";

export async function GET() {
  return NextResponse.json({
    success: true,
    name: "Aila AI Engine",
    provider: "OpenRouter",
    model: AI_MODEL,
    orchestrator: true,
    documentAnalysis: true,
    modes: [
      "intelligence",
      "legal",
      "business",
      "automation"
    ],
    apiVersion: "v1"
  });
}
