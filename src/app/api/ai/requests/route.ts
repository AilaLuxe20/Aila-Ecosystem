import { NextResponse } from "next/server";
import { getRequestCount } from "@/core/ai/metrics";

export async function GET(){
    return NextResponse.json({
        success:true,
        requests:getRequestCount()
    });
}
