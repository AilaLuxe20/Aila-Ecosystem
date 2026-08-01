import { NextResponse } from "next/server";
import { getRuntime } from "@/core/ai/runtime";

export async function GET(){

    return NextResponse.json(getRuntime());

}
