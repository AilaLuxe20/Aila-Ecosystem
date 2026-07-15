"use client";

import { useState } from "react";
import { useSpeech } from "./useSpeech";

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export function useAilaChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const { speak } = useSpeech();

  async function send(content: string) {
    if (!content.trim()) return;

    const userMessage: Message = {
      role: "user",
      content,
    };

    const history = [...messages, userMessage];

    setMessages(history);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: history,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Unable to reach Aila."
        );
      }

      const reply =
        data.reply ??
        "I couldn't generate a response.";

      const assistant: Message = {
        role: "assistant",
        content: reply,
      };

      setMessages((previous) => [
        ...previous,
        assistant,
      ]);

      speak(reply);
    } catch (error) {
      const assistant: Message = {
        role: "assistant",
        content:
          error instanceof Error
            ? error.message
            : "Unknown error.",
      };

      setMessages((previous) => [
        ...previous,
        assistant,
      ]);
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
