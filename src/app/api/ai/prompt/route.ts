import { NextResponse } from "next/server";
import { createPrompt } from "@/core/ai/builder";

export async function POST(req:Request){

    const body=await req.json();

    return NextResponse.json(

        createPrompt(
            body.mode,
            body.message
        )

    );

}
