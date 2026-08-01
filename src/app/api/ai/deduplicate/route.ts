import { NextResponse } from "next/server";
import { deduplicateMessages } from "@/core/ai/deduplicate";

export async function POST(req:Request){

    const body=await req.json();

    return NextResponse.json({

        messages:deduplicateMessages(
            body.messages ?? []
        )

    });

}
