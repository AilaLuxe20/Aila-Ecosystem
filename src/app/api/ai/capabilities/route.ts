import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    capabilities: {
      chat: true,
      documentAnalysis: true,
      orchestration: true,
      streaming: false,
      memory: false,
      vision: false,
      automation: true,
      legal: true,
      business: true,
      intelligence: true,
    },
  });
}
