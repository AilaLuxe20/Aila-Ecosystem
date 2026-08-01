import { NextResponse } from "next/server";
import { clearResponseCache } from "@/core/ai/responseCache";

export async function DELETE(){

    clearResponseCache();

    return NextResponse.json({

        success:true

    });

}
