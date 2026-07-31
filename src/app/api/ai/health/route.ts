import { NextResponse } from "next/server";
import { getOpenRouterApiKey } from "@/core/config";

export async function GET() {
  return NextResponse.json({
    success: true,
    ai: {
      configured: Boolean(getOpenRouterApiKey()),
      provider: "OpenRouter",
      status: "online",
    },
    timestamp: new Date().toISOString(),
  });
}
