import { NextResponse } from "next/server";
import { removeCapability } from "@/core/ai/capabilities";

export async function POST(req:Request){

    const body=await req.json();

    removeCapability(body.id);

    return NextResponse.json({

        success:true

    });

}
