import type { ChatMessage } from "@/core/types";

export function validateConversation(messages: ChatMessage[]) {
    return {
        valid: Array.isArray(messages),
        count: messages.length
    };
}
