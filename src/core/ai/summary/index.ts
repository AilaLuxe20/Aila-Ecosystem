import type { ChatMessage } from "@/core/types";

export function summarize(messages: ChatMessage[]) {
    return messages
        .map(message => message.content)
        .join(" ")
        .slice(0, 1000);
}
