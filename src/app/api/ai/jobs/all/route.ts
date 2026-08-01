import { NextResponse } from "next/server";
import { getJobs } from "@/core/ai/jobs";

export async function GET(){

    return NextResponse.json({

        jobs:getJobs()

    });

}
