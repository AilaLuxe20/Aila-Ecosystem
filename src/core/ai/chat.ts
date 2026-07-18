// src/core/ai/chat.ts
export interface AilaMessage {
    role: "user" | "assistant" | "system";
    content: string;
}

export async function processAilaMessage(messages: AilaMessage[], productId: string) {
    // This will interface with OpenRouter/LLM
    // Every product passes its context via productId
    console.log(`Processing request for product: ${productId}`);
    return { success: true, response: "Aila AI Core active." };
}