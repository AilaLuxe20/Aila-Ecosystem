import { NextResponse } from "next/server";
import { dequeue } from "@/core/ai/queue";

export async function POST(){

    return NextResponse.json({

        item:dequeue()

    });

}
