import type { ChatMessage } from "@/core/types";

export function compressConversation(messages: ChatMessage[]) {
    return messages.map(message => ({
        role: message.role,
        content: (message.content ?? "").trim()
    }));
}
