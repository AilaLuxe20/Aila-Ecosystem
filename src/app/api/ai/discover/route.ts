import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    discoverable: true,
    endpoints: "/api/ai/index"
  });
}
