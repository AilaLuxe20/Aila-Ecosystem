import { NextResponse } from "next/server";
import { AgentTypes } from "@/core/ai/agentTypes";

export async function GET(){

    return NextResponse.json({
        success:true,
        types:AgentTypes
    });

}
