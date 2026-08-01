import { NextResponse } from "next/server";
import {
    startTimer,
    stopTimer
} from "@/core/ai/stopwatch";

export async function GET(){

    const start=startTimer();

    return NextResponse.json({

        duration:stopTimer(start)

    });

}
