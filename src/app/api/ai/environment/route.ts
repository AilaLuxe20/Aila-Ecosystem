import { NextResponse } from "next/server";
import { getOpenRouterApiKey } from "@/core/config";

export async function GET() {
  return NextResponse.json({
    success: true,
    environment: {
      nodeEnv: process.env.NODE_ENV,
      openRouterConfigured: Boolean(getOpenRouterApiKey()),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
}
