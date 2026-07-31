import { NextResponse } from "next/server";

import {
  PROMPTS,
  DOCUMENT_ANALYSIS_PROMPT,
} from "@/core/ai/prompts";

export async function GET() {
  return NextResponse.json({
    success: true,
    prompts: {
      intelligence: PROMPTS.intelligence,
      legal: PROMPTS.legal,
      business: PROMPTS.business,
      automation: PROMPTS.automation,
      documentAnalysis: DOCUMENT_ANALYSIS_PROMPT,
    },
  });
}
