import type { ChatMessage } from "@/core/types";

import { estimateMessageTokens } from "@/core/ai/tokenizer";

export function buildUsage(messages: ChatMessage[]) {
    const prompt = estimateMessageTokens(messages);

    return {
        promptTokens: prompt,
        completionTokens: 0,
        totalTokens: prompt
    };
}
