import { NextResponse } from "next/server";
import { getJob } from "@/core/ai/jobs";

export async function POST(req:Request){

    const body=await req.json();

    return NextResponse.json({

        job:getJob(body.id)

    });

}
