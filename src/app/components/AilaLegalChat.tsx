"use client";

import { useCallback, useRef, useState } from "react";
import { track } from "@vercel/analytics";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type DocumentContext = {
  fileName: string;
  fileType: string;
  analysis: string;
};

const LEGAL_SUGGESTIONS = [
  "Summarize this document",
  "What are the key risks?",
  "Explain the termination clause",
  "What are my obligations?",
  "Identify important deadlines",
  "What should I ask a lawyer?",
];

type Props = {
  documentContext?: DocumentContext | null;
  onClearDocument?: () => void;
};

export default function AilaLegalChat({
  documentContext = null,
  onClearDocument,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        documentContext
          ? `I have a document connected: **${documentContext.fileName}**. Ask me anything about it.`
          : "Hello, I am AilaLegal AI. Upload a document or ask me about contracts, clauses, or legal risks.",
    },
  ]);

  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  function scrollToBottom() {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  const sendMessage = useCallback(
    async (customMessage?: string) => {
      const messageToSend = (customMessage || input).trim();
      if (!messageToSend || loading) return;

      track("ailalegal_chat_message_sent", {
        source: customMessage ? "suggestion" : "typed",
        hasDocument: Boolean(documentContext),
      });

      const userMessage: Message = { role: "user", content: messageToSend };
      const updatedMessages = [...messages, userMessage];

      setMessages(updatedMessages);
      setInput("");
      setLoading(true);
      setTimeout(scrollToBottom, 50);

      try {
        const response = await fetch("/api/legal-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages,
            conversationId,
            documentContext: documentContext ?? undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "AilaLegal could not respond.");
        }

        if (data?.conversationId) {
          setConversationId(data.conversationId);
        }

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              data?.message ||
              "I could not generate a response. Please try again.",
          },
        ]);
      } catch (error) {
        console.error("AilaLegal Chat Error:", error);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "AilaLegal AI is currently unavailable. Please try again.",
          },
        ]);
      } finally {
        setLoading(false);
        setTimeout(scrollToBottom, 100);
      }
    },
    [input, loading, messages, conversationId, documentContext]
  );

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-[#080808]/80 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-400/[0.05]">
            <div className="absolute h-4 w-4 rounded-full bg-violet-400/10 blur-md" />
            <div className="relative h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.8)]" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">AilaLegal AI</p>
            <p className="text-[10px] text-neutral-600">
              {documentContext
                ? `Reviewing: ${documentContext.fileName}`
                : "Legal intelligence assistant"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {documentContext && onClearDocument && (
            <button
              type="button"
              onClick={onClearDocument}
              className="text-[10px] uppercase tracking-widest text-neutral-600 transition hover:text-red-400"
            >
              Clear doc
            </button>
          )}
          <div className="flex items-center gap-2 rounded-full border border-green-400/10 bg-green-400/[0.04] px-3 py-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-400" />
            </span>
            <span className="hidden text-[9px] uppercase tracking-[0.18em] text-green-300/60 sm:block">
              Online
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="h-80 space-y-5 overflow-y-auto p-5 sm:p-6">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[88%] whitespace-pre-wrap rounded-3xl px-5 py-4 text-sm leading-7 sm:max-w-[82%] ${
                message.role === "user"
                  ? "rounded-br-md bg-white text-black"
                  : "rounded-bl-md border border-white/[0.07] bg-white/[0.035] text-neutral-300"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-3 rounded-3xl rounded-bl-md border border-white/[0.07] bg-white/[0.035] px-5 py-4">
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-300 [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pink-300 [animation-delay:300ms]" />
              </div>
              <span className="text-xs text-neutral-600">
                AilaLegal is reviewing
              </span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggestions */}
      {documentContext && (
        <div className="border-t border-white/[0.07] px-5 pt-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {LEGAL_SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => sendMessage(s)}
                disabled={loading}
                className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 text-xs text-neutral-500 transition hover:border-violet-400/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-white/[0.07] p-4 sm:p-5">
        <div className="flex gap-2 rounded-2xl border border-white/[0.09] bg-black/40 p-2 transition focus-within:border-violet-400/25">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={
              documentContext
                ? "Ask about this document..."
                : "Ask AilaLegal a question..."
            }
            disabled={loading}
            className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-700 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-30"
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}