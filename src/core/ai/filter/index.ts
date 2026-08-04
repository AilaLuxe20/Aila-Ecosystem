import type { ChatMessage } from "@/core/types";

export function filterMessages(messages: ChatMessage[]) {
    return messages.filter(
        message => message?.content
    );
}
