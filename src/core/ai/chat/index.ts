import { openRouterChat } from "@/core/ai/openrouter";

export async function chat(messages:any[]){

    return openRouterChat({

        model:"openai/gpt-5",

        messages

    });

}
