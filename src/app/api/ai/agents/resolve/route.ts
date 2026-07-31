import { NextResponse } from "next/server";
import { resolveAgent } from "@/core/ai/router";

export async function POST(req:Request){

    const {mode}=await req.json();

    return NextResponse.json({
        success:true,
        agent:resolveAgent(mode)
    });

}
