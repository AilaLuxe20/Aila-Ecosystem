import { NextResponse } from "next/server";
import { buildContext } from "@/core/ai/context";

export async function POST(req:Request){

    const body=await req.json();

    return NextResponse.json({

        context:buildContext(body.messages ?? [])

    });

}
