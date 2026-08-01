import { NextResponse } from "next/server";
import { getQueue } from "@/core/ai/queue";

export async function GET(){

    return NextResponse.json({

        pending:getQueue().length

    });

}
