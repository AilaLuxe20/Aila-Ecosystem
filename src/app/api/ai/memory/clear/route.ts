import { NextResponse } from "next/server";
import { clearMemory } from "@/core/ai/memory";

export async function POST(){

    clearMemory();

    return NextResponse.json({
        success:true
    });

}
