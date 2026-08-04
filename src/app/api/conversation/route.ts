import { NextResponse } from "next/server";
import { listConversations } from "@/core/ai/conversation";

export async function GET(){

    return NextResponse.json(listConversations());

}
