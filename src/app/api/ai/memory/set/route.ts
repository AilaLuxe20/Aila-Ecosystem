import { NextResponse } from "next/server";
import { setMemory } from "@/core/ai/memory";

export async function POST(req:Request){

    const {key,value}=await req.json();

    setMemory(key,value);

    return NextResponse.json({
        success:true
    });

}
