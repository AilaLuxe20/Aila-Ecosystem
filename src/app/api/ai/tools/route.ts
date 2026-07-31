import { NextResponse } from "next/server";
import { Tools } from "@/core/ai/tools";

export async function GET(){

    return NextResponse.json({
        success:true,
        tools:Tools
    });

}
