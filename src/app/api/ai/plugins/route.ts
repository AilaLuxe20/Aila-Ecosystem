import { NextResponse } from "next/server";
import { registerPlugin } from "@/core/ai/plugins";

export async function POST(req:Request){

    const body=await req.json();

    registerPlugin(

        body.id,

        body

    );

    return NextResponse.json({

        success:true

    });

}
