import { NextResponse } from "next/server";
import { removePlugin } from "@/core/ai/plugins";

export async function POST(req:Request){

    const body=await req.json();

    removePlugin(body.id);

    return NextResponse.json({

        success:true

    });

}
