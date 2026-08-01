import { NextResponse } from "next/server";
import { resolveModel } from "@/core/ai/resolver";

export async function GET(){

    return NextResponse.json({

        model:resolveModel()

    });

}
