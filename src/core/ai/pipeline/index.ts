import type { AIRequest } from "@/core/ai/types";

export function buildPipeline(request:AIRequest){

    return{

        receivedAt:new Date().toISOString(),

        mode:request.mode,

        messageCount:request.messages.length,

        hasDocument:Boolean(request.documentText),

        sessionId:request.sessionId ?? "default"

    };

}
