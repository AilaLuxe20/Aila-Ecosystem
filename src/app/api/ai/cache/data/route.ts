import { NextResponse } from "next/server";
import { getCache,setCache } from "@/core/ai/cache";

export async function POST(req:Request){

    const body=await req.json();

    setCache(body.key,body.value);

    return NextResponse.json({

        value:getCache(body.key)

    });

}
