import { NextResponse } from "next/server";
import { getExtensions } from "@/core/ai/extensions";

export async function GET(){

    return NextResponse.json({
        extensions:getExtensions()
    });

}
