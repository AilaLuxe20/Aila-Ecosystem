import { NextResponse } from "next/server";
import { summarize } from "@/core/ai/summary";

export async function POST(req:Request){

    const body=await req.json();

    return NextResponse.json({

        summary:summarize(body.messages ?? [])

    });

}
