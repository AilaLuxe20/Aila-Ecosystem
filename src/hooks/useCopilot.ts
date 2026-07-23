"use client";

import { useState } from "react";
import { CopilotMessage } from "@/types/copilot";
import { sendToCopilot } from "@/services/copilot.service";

export function useCopilot() {
    const [messages, setMessages] = useState<CopilotMessage[]>([]);
    const [loading, setLoading] = useState(false);

    async function send(content: string) {
        const userMessage: CopilotMessage = {
            id: crypto.randomUUID(),
            role: "user",
            content,
            createdAt: new Date(),
        };

        const updatedMessages = [...messages, userMessage];

        setMessages(updatedMessages);
        setLoading(true);

        try {
            const reply = await sendToCopilot(updatedMessages);

            const assistantMessage: CopilotMessage = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: reply,
                createdAt: new Date(),
            };

            setMessages([...updatedMessages, assistantMessage]);
        } finally {
            setLoading(false);
        }
    }

    return {
        messages,
        loading,
        send,
    };
}