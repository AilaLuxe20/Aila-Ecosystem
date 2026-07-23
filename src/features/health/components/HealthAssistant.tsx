"use client";

import { useState } from "react";

export default function HealthAssistant() {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<
        { role: "user" | "assistant"; content: string }[]
    >([
        {
            role: "assistant",
            content:
                "Hello. I'm Aila Health AI. How can I help you today?",
        },
    ]);

    function sendMessage() {
        if (!message.trim()) return;

        setMessages((prev) => [
            ...prev,
            {
                role: "user",
                content: message,
            },
        ]);

        setMessage("");
    }

    return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-xl font-semibold">
                AI Health Assistant
            </h2>

            <div className="mb-4 h-72 overflow-y-auto rounded-2xl border border-white/10 p-4">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`mb-3 rounded-xl p-3 ${msg.role === "assistant"
                                ? "bg-white/10"
                                : "bg-white text-black"
                            }`}
                    >
                        {msg.content}
                    </div>
                ))}
            </div>

            <div className="flex gap-3">
                <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask a health question..."
                    className="flex-1 rounded-xl border border-white/10 bg-transparent px-4 py-3 outline-none"
                />

                <button
                    onClick={sendMessage}
                    className="rounded-xl bg-white px-6 text-black"
                >
                    Send
                </button>
            </div>
        </div>
    );
}