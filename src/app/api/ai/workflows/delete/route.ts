import { NextResponse } from "next/server";
import { deleteWorkflow } from "@/core/ai/workflows";

export async function POST(req:Request){

    const body=await req.json();

    deleteWorkflow(body.id);

    return NextResponse.json({

        success:true

    });

}
