import { NextResponse } from "next/server";
import { validateConversation } from "@/core/ai/validator";

export async function POST(req:Request){

    const body=await req.json();

    return NextResponse.json(

        validateConversation(
            body.messages ?? []
        )

    );

}
