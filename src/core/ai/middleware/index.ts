import type { AIRequest } from "@/core/ai/types";

export async function runMiddleware(

    request:AIRequest

){

    return{

        request,

        timestamp:new Date().toISOString(),

        passed:true

    };

}
