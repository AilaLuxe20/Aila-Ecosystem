"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import DocumentUpload from "./components/DocumentUpload";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const capabilities = [
  {
    number: "01",
    title: "Document Intelligence",
    description:
      "Upload contracts and legal documents for intelligent analysis, summaries and review points.",
  },
  {
    number: "02",
    title: "Contract Risk Detection",
    description:
      "Identify clauses, obligations and potential areas that may require closer professional review.",
  },
  {
    number: "03",
    title: "Legal Conversation",
    description:
      "Ask questions about documents, contracts and general legal concepts through an intelligent workspace.",
  },
  {
    number: "04",
    title: "Clause Intelligence",
    description:
      "Understand important provisions and surface information hidden inside complex legal language.",
  },
];

const suggestions = [
  "What should I check before signing a contract?",
  "Explain a termination clause",
  "What are common contract risks?",
];

export default function AilaLegalPage() {
  const [input, setInput] = useState("");

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Welcome to AilaLegal AI. I can help you understand contracts, documents, clauses and potential review points. How can I assist you?",
    },
  ]);

  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(
    null
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function sendMessage(
    customMessage?: string
  ) {
    const messageToSend =
      customMessage || input;

    if (!messageToSend.trim() || loading) {
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: messageToSend,
    };

    const updatedMessages = [
      ...messages,
      userMessage,
    ];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/legal-chat",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            messages: updatedMessages,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "AilaLegal could not respond."
        );
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            data.message ||
            "I am ready to help you review the legal information.",
        },
      ]);
    } catch (error) {
      console.error(
        "AilaLegal Chat Error:",
        error
      );

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            "I could not connect to AilaLegal Intelligence right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030303] text-white">
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px]" />

      <div className="pointer-events-none absolute left-1/2 top-[-350px] h-[900px] w-[1100px] -translate-x-1/2 rounded-full bg-cyan-500/[0.08] blur-[200px]" />

      <div className="pointer-events-none absolute right-[-300px] top-[800px] h-[600px] w-[600px] rounded-full bg-blue-500/[0.07] blur-[180px]" />

      {/* HERO */}
      <section className="relative mx-auto max-w-7xl px-6 pb-20 pt-36">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/15 bg-cyan-300/[0.04] px-4 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />

              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
            </span>

            <span className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">
              Legal Intelligence Online
            </span>
          </div>

          <p className="mt-10 text-sm uppercase tracking-[0.3em] text-neutral-600">
            Aila Ecosystem / AilaLegal AI
          </p>

          <h1 className="mt-6 text-5xl font-semibold leading-[0.95] tracking-[-0.06em] sm:text-7xl lg:text-8xl">
            Understand documents.

            <span className="block bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-400 bg-clip-text text-transparent">
              See what matters.
            </span>
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-neutral-400">
            AilaLegal AI is an intelligent legal
            technology workspace for document
            understanding, contract analysis and
            legal information assistance.
          </p>
        </div>
      </section>

      {/* INTELLIGENCE WORKSPACE */}
      <section className="relative mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/60">
              Intelligence Workspace
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Work with AilaLegal.
            </h2>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-4 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]" />

            <span className="text-[9px] uppercase tracking-[0.18em] text-neutral-500">
              Secure Session Active
            </span>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          {/* LEGAL CHAT */}
          <div className="overflow-hidden rounded-[36px] border border-white/[0.09] bg-[#080808]/90 shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
            {/* CHAT HEADER */}
            <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-5 sm:px-8">
              <div className="flex items-center gap-4">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.05]">
                  <div className="absolute h-5 w-5 rounded-full bg-cyan-300/[0.1] blur-md" />

                  <div className="relative h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.9)]" />
                </div>

                <div>
                  <p className="text-sm font-medium">
                    AilaLegal Intelligence
                  </p>

                  <p className="mt-1 text-xs text-neutral-600">
                    Legal conversation workspace
                  </p>
                </div>
              </div>

              <span className="hidden text-xs text-neutral-700 sm:block">
                AI ASSISTANT
              </span>
            </div>

            {/* MESSAGES */}
            <div className="h-[520px] space-y-5 overflow-y-auto p-5 sm:p-8">
              {messages.map(
                (message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`flex ${
                      message.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[88%] rounded-3xl px-5 py-4 text-sm leading-7 sm:max-w-[75%] ${
                        message.role === "user"
                          ? "rounded-br-md bg-white text-black"
                          : "rounded-bl-md border border-white/[0.07] bg-white/[0.035] text-neutral-300"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                )
              )}

              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-3 rounded-3xl rounded-bl-md border border-white/[0.07] bg-white/[0.035] px-5 py-4">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />

                    <span className="text-sm text-neutral-500">
                      AilaLegal is analyzing...
                    </span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* SUGGESTIONS */}
            <div className="border-t border-white/[0.07] px-5 pt-5 sm:px-8">
              <div className="flex flex-wrap gap-2">
                {suggestions.map(
                  (suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() =>
                        sendMessage(
                          suggestion
                        )
                      }
                      disabled={loading}
                      className="rounded-full border border-white/[0.08] bg-white/[0.025] px-4 py-2 text-xs text-neutral-500 transition hover:border-cyan-300/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {suggestion}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* INPUT */}
            <div className="p-5 sm:p-8">
              <div className="flex gap-3 rounded-2xl border border-white/[0.09] bg-black/40 p-2 transition focus-within:border-cyan-300/25">
                <input
                  value={input}
                  onChange={(event) =>
                    setInput(
                      event.target.value
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter"
                    ) {
                      sendMessage();
                    }
                  }}
                  placeholder="Ask AilaLegal about a contract, clause or legal document..."
                  disabled={loading}
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-700 disabled:opacity-50"
                />

                <button
                  type="button"
                  onClick={() =>
                    sendMessage()
                  }
                  disabled={
                    loading ||
                    !input.trim()
                  }
                  className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  {loading
                    ? "..."
                    : "Send"}
                </button>
              </div>

              <p className="mt-3 text-center text-[10px] leading-5 text-neutral-700">
                AilaLegal provides general
                information and document
                assistance, not legal advice.
              </p>
            </div>
          </div>

          {/* DOCUMENT INTELLIGENCE */}
          <div className="min-w-0">
            <DocumentUpload />
          </div>
        </div>
      </section>

      {/* CAPABILITIES */}
      <section className="relative mx-auto max-w-7xl px-6 py-28">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/60">
              Legal Intelligence
            </p>

            <h2 className="mt-6 max-w-lg text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
              Read deeper.

              <span className="block text-neutral-600">
                Review smarter.
              </span>
            </h2>

            <p className="mt-7 max-w-md leading-8 text-neutral-500">
              AilaLegal transforms complex
              documents into clearer information
              so important clauses, risks and
              review points are easier to
              understand.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {capabilities.map(
              (capability) => (
                <div
                  key={capability.title}
                  className="group rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-7 transition duration-500 hover:-translate-y-1 hover:border-cyan-300/20 hover:bg-cyan-300/[0.035]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-700">
                      {
                        capability.number
                      }
                    </span>

                    <div className="h-2 w-2 rounded-full border border-neutral-700 transition group-hover:border-cyan-300 group-hover:bg-cyan-300 group-hover:shadow-[0_0_15px_rgba(103,232,249,0.8)]" />
                  </div>

                  <h3 className="mt-12 text-xl font-medium">
                    {
                      capability.title
                    }
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-neutral-500">
                    {
                      capability.description
                    }
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative mx-auto max-w-6xl px-6 py-32">
        <div className="relative overflow-hidden rounded-[40px] border border-white/[0.09] bg-white/[0.025] px-6 py-20 text-center backdrop-blur-2xl sm:px-12">
          <div className="pointer-events-none absolute left-1/2 top-[-300px] h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-cyan-500/[0.1] blur-[170px]" />

          <div className="relative">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/60">
              Legal Technology
            </p>

            <h2 className="mx-auto mt-6 max-w-4xl text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
              Build the next generation

              <span className="block text-neutral-600">
                of legal intelligence.
              </span>
            </h2>

            <p className="mx-auto mt-7 max-w-xl leading-8 text-neutral-400">
              Create intelligent legal workflows,
              document systems and AI-powered
              digital experiences with Aila.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/#start-project"
                className="inline-flex rounded-full bg-white px-9 py-4 font-semibold text-black transition duration-300 hover:scale-105"
              >
                Build a Legal AI Project
              </Link>

              <Link
                href="/#products"
                className="inline-flex rounded-full border border-white/[0.1] bg-white/[0.03] px-9 py-4 font-semibold text-neutral-300 transition hover:bg-white/[0.07]"
              >
                Explore Ecosystem
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}