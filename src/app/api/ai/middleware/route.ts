import { NextResponse } from "next/server";
import { runMiddleware } from "@/core/ai/middleware";

export async function POST(req:Request){

    const body=await req.json();

    return NextResponse.json(

        await runMiddleware(body)

    );

}
