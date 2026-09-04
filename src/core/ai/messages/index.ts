import type { ChatMessage } from "@/core/types";

export function validateMessages(messages: ChatMessage[]) {
    return messages.every(message =>
        typeof message.role === "string" &&
        typeof message.content === "string"
    );
}
