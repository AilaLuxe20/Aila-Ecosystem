import { NextResponse } from "next/server";
import { registerCapability } from "@/core/ai/capabilities";

export async function POST(req:Request){

    const body=await req.json();

    registerCapability(body.id,body);

    return NextResponse.json({

        success:true

    });

}
