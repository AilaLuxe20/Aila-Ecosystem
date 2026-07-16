"use client";

import type { RefObject } from "react";
import { motion } from "framer-motion";
import {
  ArrowUp,
  Bot,
  Copy,
  History,
  FileSearch,
  MessageSquareText,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import type { LegalDocumentContext } from "./DocumentUpload";

export type LegalMessage = {
  role: "user" | "assistant";
  content: string;
};

type AssistantPanelProps = {
  activeSuggestions: string[];
  chatEndRef: RefObject<HTMLDivElement | null>;
  clearChatAction: () => void;
  documentContext: LegalDocumentContext | null;
  input: string;
  loading: boolean;
  messages: LegalMessage[];
  setInputAction: (value: string) => void;
  sendMessageAction: (message?: string) => void;
};

export default function AssistantPanel({
  activeSuggestions,
  chatEndRef,
  clearChatAction,
  documentContext,
  input,
  loading,
  messages,
  setInputAction,
  sendMessageAction,
}: AssistantPanelProps) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="enterprise-card flex h-[calc(100vh-7rem)] min-h-[720px] flex-col overflow-hidden rounded-[16px] text-white xl:sticky xl:top-24"
    >
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-white/10 bg-white/[0.06]">
              <Bot className="h-5 w-5 text-[var(--aila-gold)]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">AI Assistant</h2>
              <p className="mt-1 text-xs text-white/45">
                {documentContext
                  ? "Document context active"
                  : "Enterprise legal workspace"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={clearChatAction}
              aria-label="Clear chat"
              className="enterprise-focus flex h-9 w-9 items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.04] text-white/45 transition hover:text-white"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-white/55">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Live
            </span>
          </div>
        </div>

        {documentContext && (
          <div className="mt-4 flex items-center gap-3 rounded-[12px] border border-[var(--aila-gold)]/20 bg-[var(--aila-gold)]/10 px-3 py-2.5">
            <FileSearch className="h-4 w-4 shrink-0 text-[var(--aila-gold)]" />
            <p className="min-w-0 truncate text-xs text-[#f7e8ad]">
              {documentContext.fileName}
            </p>
          </div>
        )}
        <div className="mt-4 flex items-center gap-3 rounded-[12px] border border-white/10 bg-white/[0.04] px-3 py-2.5">
          <History className="h-4 w-4 text-white/38" />
          <p className="text-xs text-white/45">
            Conversation history: {messages.length} messages in this session
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`group relative max-w-[88%] whitespace-pre-wrap rounded-[14px] px-4 py-3 text-sm leading-6 ${
                message.role === "user"
                  ? "bg-white text-[#111312]"
                  : "border border-white/10 bg-white/[0.06] text-white/78"
              }`}
            >
              {message.content}
              {message.role === "assistant" && (
                <button
                  type="button"
                  aria-label="Copy response"
                  onClick={() => navigator.clipboard?.writeText(message.content)}
                  className="enterprise-focus absolute -right-2 -top-2 hidden h-8 w-8 items-center justify-center rounded-[10px] border border-white/10 bg-[#111312] text-white/45 shadow-lg transition hover:text-white group-hover:flex"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-3 rounded-[14px] border border-white/10 bg-white/[0.06] px-4 py-3">
              <Sparkles className="h-4 w-4 animate-pulse text-[var(--aila-gold)]" />
              <span className="text-sm text-white/55">
                {documentContext
                  ? "Reviewing document context..."
                  : "Preparing legal analysis..."}
              </span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="border-t border-white/10 p-6">
        <div className="mb-4 flex flex-wrap gap-2">
          {activeSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => sendMessageAction(suggestion)}
              disabled={loading}
              className="enterprise-focus rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/55 transition hover:border-[var(--aila-gold)]/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <div className="flex gap-2 rounded-[14px] border border-white/10 bg-black/30 p-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-white/[0.06]">
            <MessageSquareText className="h-4 w-4 text-white/45" />
          </div>
          <input
            value={input}
            onChange={(event) => setInputAction(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendMessageAction();
              }
            }}
            placeholder={
              documentContext
                ? "Ask about this document..."
                : "Ask about a contract, clause or review point..."
            }
            disabled={loading}
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => sendMessageAction()}
            disabled={loading || !input.trim()}
            aria-label="Send message"
            className="enterprise-focus flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-white text-black transition hover:bg-[var(--aila-gold)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-3 text-center text-[11px] leading-5 text-white/35">
          AilaLegal provides general information and document assistance, not
          legal advice.
        </p>
      </div>
    </motion.aside>
  );
}
