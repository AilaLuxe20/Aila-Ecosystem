import { NextResponse } from "next/server";
import { cleanConversation } from "@/core/ai/cleaner";

export async function POST(req:Request){

    const body=await req.json();

    return NextResponse.json({

        messages:cleanConversation(
            body.messages ?? []
        )

    });

}
