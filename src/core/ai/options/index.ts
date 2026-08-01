import { AIConfig } from "@/core/ai/config";

export function createChatOptions(model?:string){

    return{

        model:model ?? AIConfig.defaultModel,

        temperature:AIConfig.temperature,

        max_tokens:AIConfig.maxTokens,

        stream:AIConfig.stream

    };

}
