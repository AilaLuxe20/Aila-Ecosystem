import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success:true,
    requests:0,
    documents:0,
    conversations:0
  });
}
