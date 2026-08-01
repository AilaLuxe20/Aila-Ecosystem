import { NextResponse } from "next/server";
import { emit } from "@/core/ai/events";

export async function POST(req:Request){

    const body=await req.json();

    emit(body.event,body.payload);

    return NextResponse.json({

        success:true

    });

}
