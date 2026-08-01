import { NextResponse } from "next/server";
import { exportConversation } from "@/core/ai/exporter";

export async function POST(req:Request){

    const body=await req.json();

    return NextResponse.json({

        export:exportConversation(
            body.messages ?? []
        )

    });

}
