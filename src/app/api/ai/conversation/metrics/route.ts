import { NextResponse } from "next/server";
import { conversationMetrics } from "@/core/ai/conversation/metrics";

export async function POST(req:Request){

    const body=await req.json();

    return NextResponse.json(

        conversationMetrics(
            body.messages ?? []
        )

    );

}
