import { NextResponse } from "next/server";
import { getProvider } from "@/core/ai/providerManager";

export async function GET(){

    return NextResponse.json(getProvider());

}
