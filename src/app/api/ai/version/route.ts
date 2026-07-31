import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    version: "1.0.0",
    codename: "Aila Core",
    api: "v1",
    released: "2026-07-31",
  });
}
