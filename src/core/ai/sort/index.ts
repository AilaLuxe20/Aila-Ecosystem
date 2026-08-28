import type { ChatMessage } from "@/core/types";

type TimedMessage = ChatMessage & { timestamp?: number };

export function sortMessages(messages: TimedMessage[]) {
    return [...messages].sort(
        (a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0)
    );
}
