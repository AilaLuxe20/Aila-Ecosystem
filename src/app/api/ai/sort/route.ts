import { NextResponse } from "next/server";
import { sortMessages } from "@/core/ai/sort";

export async function POST(req:Request){

    const body=await req.json();

    return NextResponse.json({

        messages:sortMessages(
            body.messages ?? []
        )

    });

}
