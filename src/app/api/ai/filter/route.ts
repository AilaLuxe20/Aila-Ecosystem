import { NextResponse } from "next/server";
import { filterMessages } from "@/core/ai/filter";

export async function POST(req:Request){

    const body=await req.json();

    return NextResponse.json({

        messages:filterMessages(

            body.messages ?? []

        )

    });

}
