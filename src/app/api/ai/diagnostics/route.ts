import { NextResponse } from "next/server";
import { AI_MODEL } from "@/core/constants";
import { getOpenRouterApiKey } from "@/core/config";

export async function GET() {
  return NextResponse.json({
    success: true,
    diagnostics: {
      status: "healthy",
      provider: "OpenRouter",
      model: AI_MODEL,
      apiKeyConfigured: Boolean(getOpenRouterApiKey()),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
}
