import { NextResponse } from "next/server";
import { getCapability } from "@/core/ai/capabilities";

export async function POST(req:Request){

    const body=await req.json();

    return NextResponse.json({

        capability:getCapability(body.id)

    });

}
