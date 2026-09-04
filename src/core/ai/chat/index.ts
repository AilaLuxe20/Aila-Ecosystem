import type { ChatMessage } from "@/core/types";

import { openRouterChat } from "@/core/ai/openrouter";

export async function chat(messages: ChatMessage[]) {
    return openRouterChat({
        model: "openai/gpt-5",
        messages
    });
}
