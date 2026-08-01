import { NextResponse } from "next/server";
import { sanitizePrompt } from "@/core/ai/sanitizer";

export async function POST(req:Request){

    const body=await req.json();

    return NextResponse.json({

        prompt:sanitizePrompt(body.prompt ?? "")

    });

}
