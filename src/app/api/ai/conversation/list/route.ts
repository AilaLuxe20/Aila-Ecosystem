import { NextResponse } from "next/server";
import { getConversationIds } from "@/core/ai/conversation";

export async function GET(){
    return NextResponse.json({
        success:true,
        conversations:getConversationIds()
    });
}
