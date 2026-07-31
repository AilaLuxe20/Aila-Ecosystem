import { NextResponse } from "next/server";

export async function GET(){

    return NextResponse.json({

        active:"gpt-5"

    });

}
