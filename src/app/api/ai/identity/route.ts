import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    id: "aila-ai-engine"
  });
}
