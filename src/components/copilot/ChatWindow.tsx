"use client";

import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import ChatInput from "./ChatInput";
import { useCopilot } from "@/hooks/useCopilot";

export default function ChatWindow() {
    const { messages, loading, send } = useCopilot();

    return (
        <div className="flex h-[650px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-neutral-950">
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
                {messages.map((message) => (
                    <MessageBubble
                        key={message.id}
                        message={message}
                    />
                ))}

                {loading && <TypingIndicator />}
            </div>

            <ChatInput
                onSend={send}
                disabled={loading}
            />
        </div>
    );
}