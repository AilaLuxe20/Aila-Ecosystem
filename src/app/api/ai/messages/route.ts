import { NextResponse } from "next/server";
import { validateMessages } from "@/core/ai/messages";

export async function POST(req:Request){

    const body=await req.json();

    return NextResponse.json({

        valid:validateMessages(body.messages ?? [])

    });

}
