import { NextResponse } from "next/server";
import { getPlugins } from "@/core/ai/plugins";

export async function GET(){

    return NextResponse.json({

        plugins:getPlugins()

    });

}
