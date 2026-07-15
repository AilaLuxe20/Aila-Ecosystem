import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  return NextResponse.json({
    success: true,
    reply:
      "Hello ?? I'm Aila Intelligence. My brain is currently being connected. Soon I'll be able to think, speak, remember conversations, analyze documents, generate code and build businesses with you.",
    userMessage: body.message,
  });
}
