import { NextResponse } from "next/server";
import { getMemory } from "@/core/ai/memory";

export async function POST(req:Request){

    const {key}=await req.json();

    return NextResponse.json({
        success:true,
        value:getMemory(key)
    });

}
