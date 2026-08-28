import type { ChatMessage } from "@/core/types";

export function buildContext(messages:ChatMessage[]){

    return messages
        .map(message=>`${message.role}: ${message.content}`)
        .join("\n");

}
