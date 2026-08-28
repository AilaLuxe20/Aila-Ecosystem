import { NextResponse } from "next/server";

export async function GET(){

    return NextResponse.json([
        "openai/gpt-5",
        "anthropic/claude",
        "google/gemini"
    ]);

}
