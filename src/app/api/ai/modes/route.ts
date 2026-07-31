import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    modes: [
      {
        id: "intelligence",
        name: "Aila Intelligence",
        description: "Core ecosystem intelligence",
      },
      {
        id: "legal",
        name: "AilaLegal AI",
        description: "Legal document and contract analysis",
      },
      {
        id: "business",
        name: "Aila Business AI",
        description: "Business strategy and planning",
      },
      {
        id: "automation",
        name: "Aila Automation",
        description: "Workflow automation assistant",
      },
    ],
  });
}
