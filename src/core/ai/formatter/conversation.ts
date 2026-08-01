import type { ChatMessage } from "@/core/types";

export function formatConversation(messages:ChatMessage[]){

    return messages.map(message=>({

        role:message.role,

        content:message.content.trim()

    }));

}
