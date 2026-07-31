import { NextResponse } from "next/server";
import { listConversations } from "@/core/ai/conversation/list";

export async function GET(){

    return NextResponse.json(listConversations());

}
