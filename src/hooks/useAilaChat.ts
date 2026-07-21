"use client";

import { useCallback, useState } from "react";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

type UseAilaChatOptions = {
  endpoint: string;
  initialConversationId?: string;
};

type UseAilaChatReturn = {
  messages: ChatMessage[];
  conversationId: string | null;
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  reset: () => void;
};

export function useAilaChat({
  endpoint,
  initialConversationId,
}: UseAilaChatOptions): UseAilaChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId ?? null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isLoading) return;

      const userMessage: ChatMessage = { role: "user", content: trimmed };
      const nextMessages = [...messages, userMessage];

      setMessages(nextMessages);
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: nextMessages,
            conversationId: conversationId ?? undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Request failed.");
        }

        if (!data?.message) {
          throw new Error("Empty response from server.");
        }

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.message },
        ]);

        if (data.conversationId) {
          setConversationId(data.conversationId);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [endpoint, messages, conversationId, isLoading]
  );

  const reset = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setError(null);
  }, []);

  return { messages, conversationId, isLoading, error, sendMessage, reset };
}
