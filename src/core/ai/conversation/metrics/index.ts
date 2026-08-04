import type { ChatMessage } from "@/core/types";

export function conversationMetrics(messages: ChatMessage[]) {
    return {
        messages: messages.length,
        characters: messages.reduce(
            (a, m) => a + (m.content?.length ?? 0),
            0
        )
    };
}
