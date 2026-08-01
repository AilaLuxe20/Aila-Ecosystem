import { NextResponse } from "next/server";
import { addJob } from "@/core/ai/jobs";

export async function POST(req:Request){

    const body=await req.json();

    addJob(body.id,body);

    return NextResponse.json({

        success:true

    });

}
