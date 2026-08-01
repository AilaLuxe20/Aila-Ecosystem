import { NextResponse } from "next/server";
import { createTask } from "@/core/ai/tasks";

export async function POST(req:Request){

    const body=await req.json();

    createTask(body.id,body);

    return NextResponse.json({

        success:true

    });

}
