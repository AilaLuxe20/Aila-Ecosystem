import { NextResponse } from "next/server";
import { getAISettings } from "@/core/ai/settings";

export async function GET(){

    return NextResponse.json(getAISettings());

}
