import { CopilotMessage } from "@/types/copilot";

interface CopilotResponse {
    success: boolean;
    reply: string;
    conversationId: string | null;
}

let conversationId: string | null = null;

export async function sendToCopilot(
    messages: CopilotMessage[]
): Promise<string> {
    const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            messages: messages.map((message) => ({
                role: message.role,
                content: message.content,
            })),
            conversationId,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(
            error.error ?? "Aila Copilot could not respond."
        );
    }

    const data: CopilotResponse = await response.json();

    conversationId = data.conversationId;

    return data.reply;
}