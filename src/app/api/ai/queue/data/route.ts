import { NextResponse } from "next/server";
import { enqueue,getQueue } from "@/core/ai/queue";

export async function POST(req:Request){

    const body=await req.json();

    enqueue(body);

    return NextResponse.json({

        queue:getQueue()

    });

}
