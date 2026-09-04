import type { ChatMessage } from "@/core/types";

export function estimateTokens(text: string) {
    return Math.ceil(text.length / 4);
}

export function estimateMessageTokens(messages: ChatMessage[]) {
    return messages.reduce(
        (total, message) =>
            total + estimateTokens(message.content ?? ""),
        0
    );
}
