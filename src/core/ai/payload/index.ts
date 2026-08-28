import type { ChatMessage } from "@/core/types";

import { createChatOptions } from "@/core/ai/options";

export function buildPayload(messages: ChatMessage[], model?: string) {
    return {
        ...createChatOptions(model),
        messages
    };
}
