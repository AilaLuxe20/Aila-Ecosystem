import { NextResponse } from "next/server";
import { AI_MODEL } from "@/core/constants";
import { MODE_CONFIG } from "@/core/constants";

export async function GET() {
  return NextResponse.json({
    success: true,
    metrics: {
      model: AI_MODEL,
      modes: Object.keys(MODE_CONFIG),
      totalModes: Object.keys(MODE_CONFIG).length,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    },
  });
}
