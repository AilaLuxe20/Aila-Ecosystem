import { NextResponse } from "next/server";
import {
    cacheResponse,
    getCachedResponse
} from "@/core/ai/responseCache";

export async function POST(req:Request){

    const body=await req.json();

    cacheResponse(body.id,body.response);

    return NextResponse.json({

        response:getCachedResponse(body.id)

    });

}
