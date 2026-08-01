import { NextResponse } from "next/server";
import { estimateTokens } from "@/core/ai/tokenizer";

export async function POST(req:Request){

    const body=await req.json();

    return NextResponse.json({

        tokens:estimateTokens(body.text ?? "")

    });

}
