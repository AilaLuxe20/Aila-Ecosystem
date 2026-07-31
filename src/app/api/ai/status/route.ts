import { NextResponse } from "next/server";
import { AI_MODEL } from "@/core/constants";
import { getOpenRouterApiKey } from "@/core/config";

export async function GET() {
  return NextResponse.json({
    success: true,
    status: "healthy",
    provider: "OpenRouter",
    model: AI_MODEL,
    configured: Boolean(getOpenRouterApiKey()),
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
}
