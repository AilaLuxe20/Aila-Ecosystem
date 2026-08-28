import type { ChatMessage } from "@/core/types";

export function analyzeConversation(messages: ChatMessage[]) {
    return {
        totalMessages: messages.length,
        userMessages: messages.filter(
            m => m.role === "user"
        ).length,
        assistantMessages: messages.filter(
            m => m.role === "assistant"
        ).length
    };
}
