import { NextResponse } from "next/server";
import { removeExtension } from "@/core/ai/extensions";

export async function POST(req:Request){

    const body=await req.json();

    removeExtension(body.id);

    return NextResponse.json({
        success:true
    });

}
