import { NextResponse } from "next/server";
import { executeTool } from "@/core/ai/executor";

export async function POST(req:Request){

    const body=await req.json();

    return NextResponse.json(
        await executeTool(body.tool,body.input)
    );

}
