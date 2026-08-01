import { NextResponse } from "next/server";
import { buildPayload } from "@/core/ai/payload";

export async function POST(req:Request){

    const body=await req.json();

    return NextResponse.json(

        buildPayload(
            body.messages ?? [],
            body.model
        )

    );

}
