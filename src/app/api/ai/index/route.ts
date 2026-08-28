import { NextResponse } from "next/server";

export async function GET(){

    return NextResponse.json({
        success:true,
        endpoints:[
            "/api/ai",
            "/api/ai/config",
            "/api/ai/status",
            "/api/ai/info",
            "/api/ai/provider",
            "/api/ai/models",
            "/api/ai/modes",
            "/api/ai/features",
            "/api/ai/capabilities",
            "/api/ai/environment",
            "/api/ai/runtime",
            "/api/ai/diagnostics",
            "/api/ai/history",
            "/api/ai/conversation",
            "/api/ai/sessions",
            "/api/ai/memory",
            "/api/ai/document"
        ]
    });

}
