import { NextResponse } from "next/server";
import { getAllMemory } from "@/core/ai/memory";

export async function GET(){
    return NextResponse.json({
        success:true,
        memory:getAllMemory()
    });
}
