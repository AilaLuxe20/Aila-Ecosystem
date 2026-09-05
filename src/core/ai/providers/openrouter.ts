import { openRouterChat } from "@/core/ai/openrouter";
import { openRouterModelRequestFields } from "@/core/config";

import type { AIProvider } from "./types";

export const OpenRouterProvider: AIProvider = {
  name: "OpenRouter",

  async chat(messages) {
    return openRouterChat({
      ...openRouterModelRequestFields("chat"),
      messages,
    });
  },
};
