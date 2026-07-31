import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    name: "Aila AI",
    description: "Unified AI platform powering the Aila Ecosystem."
  });
}
