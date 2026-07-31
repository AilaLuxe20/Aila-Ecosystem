import type { AIProvider } from "./types";

export const OpenRouterProvider:AIProvider={

    name:"OpenRouter",

    async chat(messages){

        return{
            provider:"OpenRouter",
            messages
        };

    }

};
