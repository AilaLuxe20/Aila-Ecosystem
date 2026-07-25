"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import type { ChatMessage, AilaMode } from "@/core/types";

type ChatInterfaceProps = {
  mode: AilaMode;
  initialMessages?: ChatMessage[];
  suggestions?: string[];
  placeholder?: string;
  headerTitle?: string;
  headerSubtitle?: string;
  headerStatus?: "online" | "offline" | "running";
  headerStatusLabel?: string;
  containerClassName?: string;
  messagesHeight?: string;
  showSuggestions?: boolean;
  showHeader?: boolean;
  endpoint?: string;
};

const defaultSuggestions: Record<AilaMode, string[]> = {
  intelligence: [
    "Build me a premium website",
    "I need a mobile app",
    "Add AI to my business",
    "Automate repetitive work",
  ],
  legal: [
    "What should I check before signing a contract?",
    "Explain a termination clause",
    "What are common contract risks?",
  ],
  business: [
    "I want to start a business",
    "How can I improve my operations?",
    "Where should I use AI?",
  ],
  automation: [
    "I have repetitive data entry",
    "How can I automate customer follow-ups?",
    "What processes can be automated?",
  ],
};

const defaultPlaceholders: Record<AilaMode, string> = {
  intelligence: "Tell Aila what you want to build...",
  legal: "Ask AilaLegal about a contract, clause or legal document...",
  business: "Ask Aila Business AI...",
  automation: "Describe a process to automate...",
};

const defaultHeaders: Record<AilaMode, { title: string; subtitle: string }> = {
  intelligence: {
    title: "Aila Intelligence",
    subtitle: "Core ecosystem intelligence",
  },
  legal: {
    title: "AilaLegal Intelligence",
    subtitle: "Legal conversation workspace",
  },
  business: {
    title: "Aila Business AI",
    subtitle: "Business intelligence assistant",
  },
  automation: {
    title: "Aila Automation",
    subtitle: "Workflow discovery assistant",
  },
};

/**
 * Single premium chat component.
 *
 * Reusable across all Aila products. Products specify only a mode
 * and the component handles the rest — API calls, suggestions,
 * styling, and behaviour.
 */
export default function ChatInterface({
  mode,
  initialMessages,
  suggestions,
  placeholder,
  headerTitle,
  headerSubtitle,
  headerStatus = "online",
  headerStatusLabel,
  containerClassName = "",
  messagesHeight = "h-[400px]",
  showSuggestions = true,
  showHeader = true,
  endpoint,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages ?? [
      {
        role: "assistant",
        content:
          mode === "intelligence"
            ? "Welcome. I am Aila Intelligence, the intelligence layer of the Aila Ecosystem. Tell me what you want to build, improve or automate."
            : mode === "legal"
              ? "Welcome to AilaLegal AI. I can help you understand contracts, documents, clauses and potential review points. How can I assist you?"
              : mode === "business"
                ? "Hello, I am Aila Business AI. How can I help your business today?"
                : "Hello, I am Aila Automation. Tell me about a process you want to automate.",
      },
    ]
  );

  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const resolvedSuggestions = suggestions ?? defaultSuggestions[mode];
  const resolvedPlaceholder = placeholder ?? defaultPlaceholders[mode];
  const resolvedHeader = headerTitle
    ? { title: headerTitle, subtitle: headerSubtitle ?? "" }
    : defaultHeaders[mode];
  const resolvedEndpoint = endpoint ?? "/api/ai";

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function sendMessage(customMessage?: string) {
    const messageToSend = (customMessage || input).trim();

    if (!messageToSend || loading) {
      return;
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: messageToSend,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(resolvedEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode,
          messages: updatedMessages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Aila Intelligence could not respond."
        );
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            data?.reply ||
            data?.message ||
            "Tell me more about what you want to create.",
        },
      ]);
    } catch (error) {
      console.error("Aila AI Engine Error:", error);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            "I could not connect right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`relative overflow-hidden rounded-[36px] border border-white/[0.09] bg-[#080808]/90 shadow-[0_40px_120px_rgba(0,0,0,0.65)] backdrop-blur-2xl ${containerClassName}`}
    >
      {/* GLOW */}
      <div className="pointer-events-none absolute left-1/2 top-[-180px] h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-500/[0.12] blur-[100px]" />

      <div className="relative">
        {/* HEADER */}
        {showHeader && (
          <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.05]">
                <div className="absolute h-6 w-6 rounded-full bg-cyan-300/[0.12] blur-lg" />

                <div className="relative h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_20px_rgba(103,232,249,0.95)]" />
              </div>

              <div>
                <h2 className="text-sm font-medium text-white">
                  {resolvedHeader.title}
                </h2>

                <p className="mt-1 text-xs text-neutral-600">
                  {resolvedHeader.subtitle}
                </p>
              </div>
            </div>

            {headerStatus && (
              <div className="flex items-center gap-2 rounded-full border border-green-400/10 bg-green-400/[0.04] px-3 py-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />

                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-400" />
                </span>

                <span className="hidden text-[9px] uppercase tracking-[0.18em] text-green-300/60 sm:block">
                  {headerStatusLabel ?? headerStatus}
                </span>
              </div>
            )}
          </div>
        )}

        {/* MESSAGES */}
        <div className={`${messagesHeight} space-y-5 overflow-y-auto p-5 sm:p-6`}>
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`flex ${
                message.role === "user"
                  ? "justify-end"
                  : "justify-start"
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
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-3 rounded-3xl rounded-bl-md border border-white/[0.07] bg-white/[0.035] px-5 py-4">
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />

                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-300 [animation-delay:150ms]" />

                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-300 [animation-delay:300ms]" />
                </div>

                <span className="text-xs text-neutral-600">
                  Aila is thinking
                </span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* SUGGESTIONS */}
        {showSuggestions && resolvedSuggestions && (
          <div className="border-t border-white/[0.07] px-5 pt-5 sm:px-6">
            <div className="flex flex-wrap gap-2">
              {resolvedSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => sendMessage(suggestion)}
                  disabled={loading}
                  className="rounded-full border border-white/[0.08] bg-white/[0.025] px-4 py-2 text-xs text-neutral-500 transition hover:border-cyan-300/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* INPUT */}
        <div className="p-5 sm:p-6">
          <div className="flex gap-2 rounded-2xl border border-white/[0.09] bg-black/40 p-2 transition focus-within:border-cyan-300/25">
            <input
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={resolvedPlaceholder}
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
    </div>
  );
}
