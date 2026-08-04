import type { ChatMessage } from "@/core/types";

export function serializeConversation(messages: ChatMessage[]) {
    return JSON.stringify(messages, null, 2);
}
