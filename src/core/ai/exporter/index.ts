import type { ChatMessage } from "@/core/types";

export function exportConversation(messages: ChatMessage[]) {
    return JSON.stringify(messages, null, 2);
}
