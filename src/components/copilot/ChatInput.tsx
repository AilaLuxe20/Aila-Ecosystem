"use client";

import { useState } from "react";

interface Props {
    onSend(message: string): void;
    disabled?: boolean;
}

export default function ChatInput({
    onSend,
    disabled,
}: Props) {
    const [value, setValue] = useState("");

    function submit() {
        const text = value.trim();

        if (!text) return;

        onSend(text);
        setValue("");
    }

    return (
        <div className="flex gap-3 border-t border-white/10 p-4">
            <input
                className="flex-1 rounded-xl border border-white/10 bg-transparent px-4 py-3 outline-none"
                placeholder="Ask Aila anything..."
                value={value}
                disabled={disabled}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        submit();
                    }
                }}
            />

            <button
                onClick={submit}
                disabled={disabled}
                className="rounded-xl bg-white px-6 py-3 font-medium text-black disabled:opacity-50"
            >
                Send
            </button>
        </div>
    );
}