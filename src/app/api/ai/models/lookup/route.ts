import { NextResponse } from "next/server";
import { getModel } from "@/core/ai/modelResolver";

export async function POST(req:Request){

    const {id}=await req.json();

    return NextResponse.json(getModel(id));

}
