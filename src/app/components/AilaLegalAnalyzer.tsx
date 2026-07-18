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

type UploadState = "idle" | "uploading" | "ready" | "error";

const LEGAL_SUGGESTIONS = [
  "Summarize this document",
  "What are the key risks?",
  "Explain the termination clause",
  "What are my obligations?",
  "Identify important deadlines",
  "What should I ask a lawyer?",
];

export default function AilaLegalAnalyzer() {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [documentContext, setDocumentContext] = useState<DocumentContext | null>(null);
  const [legalDocumentId, setLegalDocumentId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Welcome to AilaLegal. Upload a contract or legal document and I will help you understand it — or ask me a general legal question to get started.",
    },
  ]);

  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const dropRef = useRef<HTMLDivElement | null>(null);

  function scrollToBottom() {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function handleFile(file: File) {
    if (!file) return;

    const name = file.name.toLowerCase();
    if (!name.endsWith(".pdf") && !name.endsWith(".txt")) {
      setUploadError("Only PDF and TXT files are supported.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File must be smaller than 10 MB.");
      return;
    }

    setUploadState("uploading");
    setUploadError(null);
    setDocumentContext(null);

    track("ailalegal_document_uploaded", { fileType: file.type });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/legal-upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "AilaLegal could not analyze this document.");
      }

      const context: DocumentContext = {
        fileName: file.name,
        fileType: file.type || "unknown",
        analysis: data.analysis,
      };

      setDocumentContext(context);
      setUploadState("ready");

      if (data.legalDocumentId) {
        setLegalDocumentId(data.legalDocumentId);
      }

      setMessages([
        {
          role: "assistant",
          content: `I have analyzed **${file.name}**. Here is my initial review:\n\n${data.analysis}\n\nFeel free to ask me anything about this document.`,
        },
      ]);

      setConversationId(null);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("AilaLegal Upload Error:", error);
      setUploadState("error");
      setUploadError(
        error instanceof Error
          ? error.message
          : "Document analysis failed. Please try again."
      );
    }
  }

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function clearDocument() {
    setDocumentContext(null);
    setLegalDocumentId(null);
    setUploadState("idle");
    setUploadError(null);
    setMessages([
      {
        role: "assistant",
        content:
          "Document cleared. Upload a new document or ask me a general legal question.",
      },
    ]);
    setConversationId(null);
  }

  const sendMessage = useCallback(
    async (customMessage?: string) => {
      const messageToSend = (customMessage || input).trim();
      if (!messageToSend || chatLoading) return;

      track("ailalegal_chat_message_sent", {
        source: customMessage ? "suggestion" : "typed",
        hasDocument: Boolean(documentContext),
      });

      const userMessage: Message = { role: "user", content: messageToSend };
      const updatedMessages = [...messages, userMessage];

      setMessages(updatedMessages);
      setInput("");
      setChatLoading(true);
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
              data?.message || "I could not generate a response. Please try again.",
          },
        ]);
      } catch (error) {
        console.error("AilaLegal Chat Error:", error);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "I could not connect right now. Please try again.",
          },
        ]);
      } finally {
        setChatLoading(false);
        setTimeout(scrollToBottom, 100);
      }
    },
    [input, chatLoading, messages, conversationId, documentContext]
  );

  return (
    <div className="flex h-full w-full flex-col gap-6 lg:flex-row">
      {/* LEFT — UPLOAD PANEL */}
      <div className="flex w-full flex-col gap-4 lg:w-80 lg:shrink-0">
        {/* Upload zone */}
        <div
          ref={dropRef}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 transition hover:border-violet-400/30 hover:bg-violet-400/[0.02]"
        >
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/[0.03] to-transparent" />

          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
            {uploadState === "uploading" ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
            ) : uploadState === "ready" ? (
              <svg className="h-5 w-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-neutral-500 transition group-hover:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            )}
          </div>

          <div className="text-center">
            <p className="text-sm font-medium text-white/70 transition group-hover:text-white">
              {uploadState === "uploading"
                ? "Analyzing document..."
                : uploadState === "ready"
                ? "Document ready"
                : "Upload document"}
            </p>
            <p className="mt-1 text-xs text-neutral-600">
              PDF or TXT · Max 10 MB
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt"
            onChange={onFileInput}
            className="hidden"
          />
        </div>

        {/* Upload error */}
        {uploadError && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/[0.05] px-4 py-3">
            <p className="text-xs text-red-400">{uploadError}</p>
          </div>
        )}

        {/* Active document */}
        {documentContext && uploadState === "ready" && (
          <div className="rounded-2xl border border-violet-400/15 bg-violet-400/[0.04] px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-violet-300">
                  {documentContext.fileName}
                </p>
                <p className="mt-0.5 text-[10px] text-neutral-600">
                  Connected to conversation
                </p>
              </div>
              <button
                type="button"
                onClick={clearDocument}
                className="shrink-0 text-neutral-600 transition hover:text-red-400"
                title="Remove document"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {documentContext && (
          <div className="flex flex-col gap-2">
            <p className="px-1 text-[10px] uppercase tracking-widest text-neutral-700">
              Quick questions
            </p>
            {LEGAL_SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => sendMessage(s)}
                disabled={chatLoading}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-left text-xs text-neutral-500 transition hover:border-violet-400/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT — CHAT PANEL */}
      <div className="flex min-h-[520px] flex-1 flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-[#080808]/80 backdrop-blur-xl">
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

        {/* Messages */}
        <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
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

          {chatLoading && (
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
              disabled={chatLoading}
              className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-700 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => sendMessage()}
              disabled={chatLoading || !input.trim()}
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-30"
            >
              {chatLoading ? "..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}