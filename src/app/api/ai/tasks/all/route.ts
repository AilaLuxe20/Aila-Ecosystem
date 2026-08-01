import { NextResponse } from "next/server";
import { getAllTasks } from "@/core/ai/tasks";

export async function GET(){

    return NextResponse.json({

        tasks:getAllTasks()

    });

}
