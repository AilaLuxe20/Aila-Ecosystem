import { NextResponse } from "next/server";

export async function GET(){

    return NextResponse.json({
        success:true,
        now:new Date().toISOString()
    });

}
