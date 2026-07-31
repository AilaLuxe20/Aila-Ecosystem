import { NextResponse } from "next/server";
import { getLogs } from "@/core/ai/logging";

export async function GET() {
  return NextResponse.json({
    success:true,
    logs:getLogs()
  });
}
