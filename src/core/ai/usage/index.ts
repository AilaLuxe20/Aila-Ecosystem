import { estimateMessageTokens } from "@/core/ai/tokenizer";

export function buildUsage(messages:any[]){

    const prompt=estimateMessageTokens(messages);

    return{

        promptTokens:prompt,

        completionTokens:0,

        totalTokens:prompt

    };

}
