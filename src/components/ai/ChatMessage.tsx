"use client";

import type { ChatMessage } from "@/core/types";

type ChatMessageProps = {
  message: ChatMessage;
};

/**
 * Renders a single chat message bubble.
 *
 * User messages are right-aligned with a white background;
 * assistant messages are left-aligned with a muted border.
 */
export default function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div
      className={`flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[88%] rounded-3xl px-5 py-4 text-sm leading-7 sm:max-w-[80%] ${
          message.role === "user"
            ? "rounded-br-md bg-white text-black"
            : "rounded-bl-md border border-white/[0.07] bg-white/[0.035] text-neutral-300"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
