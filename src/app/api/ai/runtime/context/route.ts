import { NextResponse } from "next/server";
import { getRuntimeContext } from "@/core/ai/runtimeContext";

export async function GET(){

    return NextResponse.json(

        getRuntimeContext()

    );

}
