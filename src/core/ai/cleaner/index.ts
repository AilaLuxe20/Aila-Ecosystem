import type { ChatMessage } from "@/core/types";

export function cleanConversation(messages: ChatMessage[]) {
    return messages.filter(
        message =>
            typeof message.content === "string" &&
            message.content.trim().length > 0
    );
}
