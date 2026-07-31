import { NextResponse } from "next/server";
import { getAgents } from "@/core/ai/agents";

export async function GET(){

    return NextResponse.json({
        success:true,
        agents:getAgents()
    });

}
