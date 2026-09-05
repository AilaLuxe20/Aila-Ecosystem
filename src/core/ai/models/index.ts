import type { AIModel } from "./types";

export const Models:AIModel[]=[

    {
        id:"z-ai/glm-5.2:free",
        name:"GLM 5.2 Free",
        provider:"Zhipu"
    },

    {
        id:"openrouter/free",
        name:"OpenRouter Free Router",
        provider:"OpenRouter"
    },

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
