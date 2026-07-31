import type { AIModel } from "./types";

export const Models:AIModel[]=[

    {
        id:"gpt-5",
        name:"GPT-5",
        provider:"OpenAI"
    },

    {
        id:"claude-sonnet-4",
        name:"Claude Sonnet 4",
        provider:"Anthropic"
    },

    {
        id:"gemini-2.5-pro",
        name:"Gemini 2.5 Pro",
        provider:"Google"
    }

];
