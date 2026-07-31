import { NextResponse } from "next/server";

export async function GET(){
    return NextResponse.json({
        success:true,
        build:"production",
        generated:new Date().toISOString()
    });
}
