import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    modules: [
      "Engine",
      "Orchestrator",
      "Document",
      "Prompt"
    ]
  });
}
