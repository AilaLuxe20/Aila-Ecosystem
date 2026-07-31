import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    heartbeat: "alive",
    timestamp: new Date().toISOString()
  });
}
