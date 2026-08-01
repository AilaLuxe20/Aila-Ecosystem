import { NextResponse } from "next/server";
import { createContextWindow } from "@/core/ai/window";

export async function POST(req:Request){

    const body=await req.json();

    return NextResponse.json({

        messages:createContextWindow(

            body.messages ?? [],
            body.limit ?? 20

        )

    });

}
