import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    routes: [
      "/api/ai",
      "/api/ai/document",
      "/api/ai/config",
      "/api/ai/health",
      "/api/ai/status",
      "/api/ai/info",
      "/api/ai/version",
      "/api/ai/models",
      "/api/ai/provider",
      "/api/ai/prompt",
      "/api/ai/modes",
      "/api/ai/capabilities",
    ],
  });
}
