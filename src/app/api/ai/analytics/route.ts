import { NextResponse } from "next/server";
import { analyzeConversation } from "@/core/ai/analytics";

export async function POST(req:Request){

    const body=await req.json();

    return NextResponse.json(

        analyzeConversation(
            body.messages ?? []
        )

    );

}
