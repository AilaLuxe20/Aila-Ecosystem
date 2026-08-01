import { NextResponse } from "next/server";
import { mergeMessages } from "@/core/ai/merge";

export async function POST(req:Request){

    const body=await req.json();

    return NextResponse.json({

        messages:mergeMessages(

            body.history ?? [],
            body.current ?? []

        )

    });

}
