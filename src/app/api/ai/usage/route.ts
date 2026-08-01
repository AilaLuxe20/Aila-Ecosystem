import { NextResponse } from "next/server";
import { buildUsage } from "@/core/ai/usage";

export async function POST(req:Request){

    const body=await req.json();

    return NextResponse.json(

        buildUsage(body.messages ?? [])

    );

}
