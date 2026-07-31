import { NextResponse } from "next/server";
import { deleteSession } from "@/core/ai/sessions";

export async function POST(req:Request){

    const {id}=await req.json();

    deleteSession(id);

    return NextResponse.json({
        success:true
    });

}
