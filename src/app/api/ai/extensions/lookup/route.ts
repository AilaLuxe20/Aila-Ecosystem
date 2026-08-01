import { NextResponse } from "next/server";
import { getExtension } from "@/core/ai/extensions";

export async function POST(req:Request){

    const body=await req.json();

    return NextResponse.json({
        extension:getExtension(body.id)
    });

}
