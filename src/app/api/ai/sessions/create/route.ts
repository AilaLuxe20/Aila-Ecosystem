import { NextResponse } from "next/server";
import { createSession } from "@/core/ai/sessions";

export async function POST(req:Request){

    const {id}=await req.json();

    createSession(id);

    return NextResponse.json({
        success:true
    });

}
