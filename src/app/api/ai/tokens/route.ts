import { NextResponse } from "next/server";
import { estimateTokens } from "@/core/ai/tokens";

export async function POST(req:Request){

    const {text=""}=await req.json();

    return NextResponse.json({
        success:true,
        estimatedTokens:estimateTokens(text)
    });

}
