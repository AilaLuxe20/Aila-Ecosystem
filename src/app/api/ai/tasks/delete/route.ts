import { NextResponse } from "next/server";
import { deleteTask } from "@/core/ai/tasks";

export async function POST(req:Request){

    const body=await req.json();

    deleteTask(body.id);

    return NextResponse.json({

        success:true

    });

}
