import { NextResponse } from "next/server";

export async function GET(){
    return NextResponse.json({
        success:true,
        node:process.version,
        platform:process.platform,
        arch:process.arch
    });
}
