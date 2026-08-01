import { NextResponse } from "next/server";
import { getRequests } from "@/core/ai/requestLogger";

export async function GET(){

    return NextResponse.json({

        requests:getRequests()

    });

}
