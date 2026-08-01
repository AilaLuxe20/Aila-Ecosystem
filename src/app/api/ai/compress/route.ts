import { NextResponse } from "next/server";
import { compressConversation } from "@/core/ai/compress";

export async function POST(req:Request){

    const body=await req.json();

    return NextResponse.json({

        messages:compressConversation(
            body.messages ?? []
        )

    });

}
