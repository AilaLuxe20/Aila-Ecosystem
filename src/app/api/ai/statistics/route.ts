import { NextResponse } from "next/server";
import { buildStatistics } from "@/core/ai/statistics";

export async function GET(){

    return NextResponse.json(

        buildStatistics()

    );

}
