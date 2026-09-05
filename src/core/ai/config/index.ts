import { getOpenRouterChatModel } from "@/core/config";

export const AIConfig = {
  get defaultModel() {
    return getOpenRouterChatModel();
  },
  temperature: 0.3,
  maxTokens: 4096,
  stream: true,
};
