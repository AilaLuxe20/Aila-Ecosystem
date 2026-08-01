import { NextResponse } from "next/server";
import { removeJob } from "@/core/ai/jobs";

export async function POST(req:Request){

    const body=await req.json();

    removeJob(body.id);

    return NextResponse.json({

        success:true

    });

}
