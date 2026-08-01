import { NextResponse } from "next/server";
import { registerExtension } from "@/core/ai/extensions";

export async function POST(req:Request){

    const body=await req.json();

    registerExtension(
        body.id,
        body
    );

    return NextResponse.json({
        success:true
    });

}
