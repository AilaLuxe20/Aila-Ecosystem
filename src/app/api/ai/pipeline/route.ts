import { NextResponse } from "next/server";
import { buildPipeline } from "@/core/ai/pipeline";

export async function POST(req:Request){

    const body=await req.json();

    return NextResponse.json(

        buildPipeline(body)

    );

}
