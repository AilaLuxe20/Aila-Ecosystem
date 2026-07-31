import { NextResponse } from "next/server";
import { getSessions } from "@/core/ai/sessions";

export async function GET(){

    return NextResponse.json({
        success:true,
        sessions:getSessions()
    });

}
