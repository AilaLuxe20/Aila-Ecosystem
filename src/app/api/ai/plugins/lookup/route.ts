import { NextResponse } from "next/server";
import { getPlugin } from "@/core/ai/plugins";

export async function POST(req:Request){

    const body=await req.json();

    return NextResponse.json({

        plugin:getPlugin(body.id)

    });

}
