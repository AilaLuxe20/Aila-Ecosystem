import { NextResponse } from "next/server";
import { clearCache } from "@/core/ai/cache";

export async function DELETE(){

    clearCache();

    return NextResponse.json({

        success:true

    });

}
