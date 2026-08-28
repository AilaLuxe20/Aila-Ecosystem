import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    runtime: {
      node: process.version,
      platform: process.platform,
      architecture: process.arch,
      environment: process.env.NODE_ENV,
      pid: process.pid,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
}
