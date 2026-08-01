import { NextResponse } from "next/server";
import { serializeConversation } from "@/core/ai/serializer";

export async function POST(req:Request){

    const body=await req.json();

    return NextResponse.json({

        data:serializeConversation(body.messages ?? [])

    });

}
