import { NextResponse } from "next/server";
import { getModels } from "@/core/ai/modelResolver";

export async function GET(){

    return NextResponse.json(getModels());

}
