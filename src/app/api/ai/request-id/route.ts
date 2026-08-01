import { NextResponse } from "next/server";
import { createRequestId } from "@/core/ai/requestId";

export async function GET(){

    return NextResponse.json({

        id:createRequestId()

    });

}
