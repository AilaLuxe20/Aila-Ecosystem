import type { ChatMessage } from "@/core/types";

export function mergeMessages(
    history: ChatMessage[],
    current: ChatMessage[]
) {
    return [
        ...history,
        ...current
    ];
}
