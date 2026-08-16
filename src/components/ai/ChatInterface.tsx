"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
import type { ChatMessage, AilaMode } from "@/core/types";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

type ConversationSummary = {
  id: string;
  mode: string;
  title: string | null;
  updatedAt: string;
  messageCount: number;
};

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
  showConversationHistory?: boolean;
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
  ads: [
    "Help me plan an ad campaign",
    "How should I target my audience?",
    "Where should I allocate my budget?",
  ],
  apps: [
    "I have an app idea",
    "Web, iOS, or Android — what fits me?",
    "What should my MVP include?",
  ],
  calendar: [
    "Help me plan a booking workflow",
    "How can I reduce scheduling back-and-forth?",
    "What reminders should I set up?",
  ],
  commerce: [
    "I want to sell online",
    "How can I improve my checkout?",
    "How do I increase conversion?",
  ],
  flow: [
    "Map out my current process",
    "Where is my workflow breaking down?",
    "Help me connect two tools together",
  ],
  sites: [
    "I need a new website",
    "What pages should my site have?",
    "Help me plan my site structure",
  ],
};

const defaultPlaceholders: Record<AilaMode, string> = {
  intelligence: "Tell Aila what you want to build...",
  legal: "Ask AilaLegal about a contract, clause or legal document...",
  business: "Ask Aila Business AI...",
  automation: "Describe a process to automate...",
  ads: "Ask Aila Ads about a campaign...",
  apps: "Tell Aila Apps about your app idea...",
  calendar: "Ask Aila Calendar about scheduling...",
  commerce: "Ask Aila Commerce about your store...",
  flow: "Describe a workflow to connect...",
  sites: "Tell Aila Sites about your website...",
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
  ads: {
    title: "Aila Ads",
    subtitle: "Advertising intelligence assistant",
  },
  apps: {
    title: "Aila Apps",
    subtitle: "App planning assistant",
  },
  calendar: {
    title: "Aila Calendar",
    subtitle: "Scheduling assistant",
  },
  commerce: {
    title: "Aila Commerce",
    subtitle: "Commerce intelligence assistant",
  },
  flow: {
    title: "Aila Flow",
    subtitle: "Connected process assistant",
  },
  sites: {
    title: "Aila Sites",
    subtitle: "Website planning assistant",
  },
};

const defaultWelcomeMessages: Record<AilaMode, string> = {
  intelligence:
    "Welcome. I am Aila Intelligence, the intelligence layer of the Aila Ecosystem. Tell me what you want to build, improve or automate.",
  legal:
    "Welcome to AilaLegal AI. I can help you understand contracts, documents, clauses and potential review points. How can I assist you?",
  business:
    "Hello, I am Aila Business AI. How can I help your business today?",
  automation:
    "Hello, I am Aila Automation. Tell me about a process you want to automate.",
  ads: "Hello, I am Aila Ads. Tell me about the campaign you want to plan.",
  apps: "Hello, I am Aila Apps. Tell me about the app you want to build.",
  calendar:
    "Hello, I am Aila Calendar. Tell me about the scheduling workflow you need.",
  commerce:
    "Hello, I am Aila Commerce. Tell me about the store you want to build or improve.",
  flow: "Hello, I am Aila Flow. Tell me about the process you want to connect.",
  sites: "Hello, I am Aila Sites. Tell me about the website you want to build.",
};

/**
 * Single premium chat component.
 *
 * Reusable across all Aila products. Products specify only a mode
 * and the component handles the rest — API calls, suggestions,
 * styling, and behaviour.
 *
 * This file is the controller: it owns the conversation state
 * (input, messages, typing) and delegates rendering to the
 * presentational sub-components (ChatMessages, ChatInput, …).
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
  showConversationHistory = false,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages ?? [
      {
        role: "assistant",
        content: defaultWelcomeMessages[mode],
      },
    ]
  );

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [typing, setTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationListStatus, setConversationListStatus] = useState<
    "idle" | "loading" | "ready" | "signed-out" | "error"
  >("idle");

  useEffect(() => {
    const STORAGE_KEY = `aila-chat-${mode}`;

    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed) && parsed.length > 0) {
        queueMicrotask(() => setMessages(parsed));
      }
    } catch {
      console.warn("Unable to restore previous conversation.");
    }
  }, [mode]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem(`aila-chat-${mode}`, JSON.stringify(messages));
  }, [messages, mode]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const STORAGE_KEY = `aila-session-${mode}`;
    const existing = localStorage.getItem(STORAGE_KEY);

    if (existing) {
      queueMicrotask(() => setConversationId(existing));
    }
  }, [mode]);

  const refreshConversations = useCallback(async () => {
    if (!showConversationHistory) {
      return;
    }

    setConversationListStatus("loading");

    try {
      const response = await fetch("/api/ai/conversation/list");

      if (response.status === 401) {
        setConversationListStatus("signed-out");
        setConversations([]);
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to load conversations.");
      }

      const data = await response.json();

      setConversations(Array.isArray(data.conversations) ? data.conversations : []);
      setConversationListStatus("ready");
    } catch {
      setConversationListStatus("error");
    }
  }, [showConversationHistory]);

  useEffect(() => {
    queueMicrotask(() => void refreshConversations());
  }, [refreshConversations]);

  const resolvedSuggestions = suggestions ?? defaultSuggestions[mode];
  const resolvedPlaceholder = placeholder ?? defaultPlaceholders[mode];
  const resolvedHeader = headerTitle
    ? { title: headerTitle, subtitle: headerSubtitle ?? "" }
    : defaultHeaders[mode];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, typing]);

  function resetConversation() {
    setConversationId(null);
    setMessages([
      {
        role: "assistant",
        content: defaultWelcomeMessages[mode],
      },
    ]);

    if (typeof window !== "undefined") {
      localStorage.removeItem(`aila-session-${mode}`);
      localStorage.removeItem(`aila-chat-${mode}`);
    }
  }

  async function loadConversation(id: string) {
    if (typing) {
      return;
    }

    try {
      const response = await fetch(
        `/api/ai/conversation?conversationId=${encodeURIComponent(id)}`
      );

      if (!response.ok) {
        throw new Error("Unable to load conversation.");
      }

      const data = await response.json();
      const loadedMessages = data?.conversation?.messages;

      if (Array.isArray(loadedMessages)) {
        setConversationId(id);
        setMessages(loadedMessages);
        localStorage.setItem(`aila-session-${mode}`, id);
      }
    } catch {
      setConversationListStatus("error");
    }
  }

  async function deleteConversation(id: string) {
    if (typing) {
      return;
    }

    const previous = conversations;
    setConversations((current) =>
      current.filter((conversation) => conversation.id !== id)
    );

    if (conversationId === id) {
      resetConversation();
    }

    try {
      const response = await fetch(
        `/api/ai/conversation?conversationId=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Unable to delete conversation.");
      }
    } catch {
      setConversations(previous);
      setConversationListStatus("error");
    }
  }

  async function sendMessage(customMessage?: string) {
    const messageToSend = (customMessage || input).trim();

    if (!messageToSend || typing) {
      return;
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: messageToSend,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setTyping(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode,
          conversationId,
          sessionId: conversationId,
          messages: updatedMessages,
        }),
      });

      if (!response.ok) {
        throw new Error("Aila Intelligence could not respond.");
      }

      const data = await response.json();

      if (typeof data.conversationId === "string") {
        setConversationId(data.conversationId);
        localStorage.setItem(`aila-session-${mode}`, data.conversationId);
      }

      setTyping(false);
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: data.reply,
        },
      ]);
      void refreshConversations();
    } catch {
      setTyping(false);
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    }
  }

  return (
    <div
      className={`relative overflow-hidden rounded-[36px] border border-white/[0.09] bg-[#080808]/90 shadow-[0_40px_120px_rgba(0,0,0,0.65)] backdrop-blur-2xl ${containerClassName}`}
    >
      {/* GLOW */}
      <div className="pointer-events-none absolute left-1/2 top-[-180px] h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-500/[0.12] blur-[100px]" />

      <div
        className={`relative ${showConversationHistory ? "grid min-h-full lg:grid-cols-[250px_minmax(0,1fr)]" : ""}`}
      >
        {showConversationHistory && (
          <aside className="border-b border-white/[0.07] bg-black/20 p-4 lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-white">Conversations</p>
                <p className="mt-1 text-[11px] text-neutral-600">
                  Saved intelligence threads
                </p>
              </div>

              <button
                type="button"
                onClick={resetConversation}
                disabled={typing}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-neutral-400 transition hover:border-cyan-300/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Start new conversation"
                title="Start new conversation"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 max-h-52 space-y-1 overflow-y-auto pr-1 lg:max-h-[500px]">
              {conversationListStatus === "loading" && (
                <p className="px-2 py-3 text-xs text-neutral-600">Loading...</p>
              )}

              {conversationListStatus === "signed-out" && (
                <p className="px-2 py-3 text-xs leading-5 text-neutral-600">
                  Sign in to save and reopen conversations.
                </p>
              )}

              {conversationListStatus === "error" && (
                <p className="px-2 py-3 text-xs leading-5 text-red-300/70">
                  Conversation history is unavailable.
                </p>
              )}

              {conversationListStatus === "ready" && conversations.length === 0 && (
                <p className="px-2 py-3 text-xs leading-5 text-neutral-600">
                  No saved conversations yet.
                </p>
              )}

              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`group flex items-center gap-2 rounded-2xl border px-2 py-2 transition ${
                    conversation.id === conversationId
                      ? "border-cyan-300/20 bg-cyan-300/[0.06]"
                      : "border-transparent hover:border-white/[0.08] hover:bg-white/[0.03]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => loadConversation(conversation.id)}
                    disabled={typing}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left disabled:cursor-not-allowed"
                  >
                    <MessageSquare className="h-4 w-4 shrink-0 text-cyan-300/60" />
                    <span className="min-w-0">
                      <span className="block truncate text-xs text-neutral-300">
                        {conversation.title ?? "New conversation"}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-neutral-700">
                        {conversation.messageCount} messages
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteConversation(conversation.id)}
                    disabled={typing}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-neutral-700 opacity-0 transition hover:bg-red-400/10 hover:text-red-300 group-hover:opacity-100 disabled:cursor-not-allowed"
                    aria-label="Delete conversation"
                    title="Delete conversation"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </aside>
        )}

        <div className="min-w-0">
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
        <ChatMessages
          messages={messages}
          typing={typing}
          messagesHeight={messagesHeight}
          chatEndRef={chatEndRef}
        />

        {/* SUGGESTIONS */}
        {showSuggestions && resolvedSuggestions && (
          <div className="border-t border-white/[0.07] px-5 pt-5 sm:px-6">
            <div className="flex flex-wrap gap-2">
              {resolvedSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => sendMessage(suggestion)}
                  disabled={typing}
                  className="rounded-full border border-white/[0.08] bg-white/[0.025] px-4 py-2 text-xs text-neutral-500 transition hover:border-cyan-300/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* INPUT */}
        <ChatInput
          input={input}
          placeholder={resolvedPlaceholder}
          typing={typing}
          onChange={setInput}
          onSend={() => sendMessage()}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              sendMessage();
            }
          }}
        />
        </div>
      </div>
    </div>
  );
}
