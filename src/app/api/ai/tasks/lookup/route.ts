import { NextResponse } from "next/server";
import { getTask } from "@/core/ai/tasks";

export async function POST(req:Request){

    const body=await req.json();

    return NextResponse.json({

        task:getTask(body.id)

    });

}
