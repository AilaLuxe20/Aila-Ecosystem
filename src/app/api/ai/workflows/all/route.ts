import { NextResponse } from "next/server";
import { getWorkflows } from "@/core/ai/workflows";

export async function GET(){

    return NextResponse.json({

        workflows:getWorkflows()

    });

}
