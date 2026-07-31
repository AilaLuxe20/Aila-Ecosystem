import { buildSystemPrompt } from "@/core/ai/prompt";
import { Templates } from "@/core/ai/templates";

export function createPrompt(mode:string,user:string){

    return {

        system:buildSystemPrompt({mode}),

        template:Templates[mode as keyof typeof Templates] ??
        Templates.intelligence,

        user

    };

}
