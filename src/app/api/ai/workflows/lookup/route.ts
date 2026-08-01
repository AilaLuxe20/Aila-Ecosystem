import { NextResponse } from "next/server";
import { getWorkflow } from "@/core/ai/workflows";

export async function POST(req:Request){

    const body=await req.json();

    return NextResponse.json({

        workflow:getWorkflow(body.id)

    });

}
