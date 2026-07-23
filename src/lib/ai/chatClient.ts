export interface ChatRequest {
    messages: {
        role: "user" | "assistant";
        content: string;
    }[];
    conversationId?: string | null;
}

export interface ChatResponse {
    success: boolean;
    reply: string;
    conversationId: string | null;
    error?: string;
}

export async function chat(
    request: ChatRequest
): Promise<ChatResponse> {
    const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
    });

    return response.json();
}