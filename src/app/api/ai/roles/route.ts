import { NextResponse } from "next/server";
import { AIRoles } from "@/core/ai/roles";

export async function GET(){

    return NextResponse.json({
        success:true,
        roles:AIRoles
    });

}
