import { createChatOptions } from "@/core/ai/options";

export function buildPayload(messages:any[],model?:string){

    return{

        ...createChatOptions(model),

        messages

    };

}
