import { AI_MODEL } from "@/core/constants";
import { openRouterChat } from "@/core/ai/openrouter";

import type { AIProvider } from "./types";

export const OpenRouterProvider: AIProvider = {
  name: "OpenRouter",

  async chat(messages) {
    return openRouterChat({
      model: AI_MODEL,
      messages,
    });
  },
};
