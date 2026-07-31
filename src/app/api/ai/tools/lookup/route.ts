import { NextResponse } from "next/server";
import { resolveTool } from "@/core/ai/toolResolver";

export async function POST(req:Request){

    const {tool}=await req.json();

    return NextResponse.json(resolveTool(tool));

}
