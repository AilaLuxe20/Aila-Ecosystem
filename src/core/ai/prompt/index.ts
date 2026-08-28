export interface PromptContext{
    mode:string;
    document?:string;
}

export function buildSystemPrompt(context:PromptContext){

    switch(context.mode){

        case "legal":
            return "You are AilaLegal, an expert legal AI.";

        case "business":
            return "You are Aila Business AI.";

        case "automation":
            return "You are Aila Automation AI.";

        default:
            return "You are Aila Intelligence.";
    }

}
