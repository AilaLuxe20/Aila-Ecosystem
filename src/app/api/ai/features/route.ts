import { NextResponse } from "next/server";

export async function GET(){
    return NextResponse.json({
        success:true,
        features:[
            "Chat",
            "Legal AI",
            "Business AI",
            "Automation",
            "Document Analysis"
        ]
    });
}
