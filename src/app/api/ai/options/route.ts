import { NextResponse } from "next/server";
import { createChatOptions } from "@/core/ai/options";

export async function GET(){

    return NextResponse.json(

        createChatOptions()

    );

}
