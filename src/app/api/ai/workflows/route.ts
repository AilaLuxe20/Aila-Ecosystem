import { NextResponse } from "next/server";
import { registerWorkflow } from "@/core/ai/workflows";

export async function POST(req:Request){

    const body=await req.json();

    registerWorkflow(

        body.id,

        body

    );

    return NextResponse.json({

        success:true

    });

}
