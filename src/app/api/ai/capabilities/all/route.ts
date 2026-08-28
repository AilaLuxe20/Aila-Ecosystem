import { NextResponse } from "next/server";
import { getCapabilities } from "@/core/ai/capabilities";

export async function GET(){

    return NextResponse.json({

        capabilities:getCapabilities()

    });

}
