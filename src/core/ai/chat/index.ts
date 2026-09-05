import type { ChatMessage } from "@/core/types";

import { openRouterChat } from "@/core/ai/openrouter";
import { openRouterModelRequestFields } from "@/core/config";

export async function chat(messages: ChatMessage[]) {
    return openRouterChat({
        ...openRouterModelRequestFields("chat"),
        messages
    });
}
