"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
} from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const suggestions = [
  "Analyze my business",
  "Find automation opportunities",
  "Help me validate an idea",
  "How can AI improve my company?",
];

const discoverySteps = [
  {
    number: "01",
    title: "Understand",
    description:
      "Map the business, customers and current operations.",
  },
  {
    number: "02",
    title: "Discover",
    description:
      "Find friction, repeated work and missed opportunities.",
  },
  {
    number: "03",
    title: "Design",
    description:
      "Turn the strongest opportunities into practical systems.",
  },
  {
    number: "04",
    title: "Execute",
    description:
      "Move from insight to software, AI and automation.",
  },
];

const capabilities = [
  {
    number: "01",
    title: "Business Intelligence",
    description:
      "Turn business challenges into clear insights, opportunities and practical next moves.",
  },
  {
    number: "02",
    title: "AI Opportunity Discovery",
    description:
      "Identify where AI can create meaningful value instead of adding unnecessary complexity.",
  },
  {
    number: "03",
    title: "Workflow Intelligence",
    description:
      "Discover repetitive processes and transform them into smarter connected workflows.",
  },
  {
    number: "04",
    title: "Product Strategy",
    description:
      "Shape business ideas into focused digital products, platforms and intelligent experiences.",
  },
];

export default function AilaBusinessPage() {
  const [input, setInput] = useState("");

  const [messages, setMessages] = useState<
    Message[]
  >([
    {
      role: "assistant",
      content:
        "Tell me about your business, idea or biggest operational challenge. I’ll help you identify the strongest opportunities for growth, AI and automation.",
    },
  ]);

  const [loading, setLoading] =
    useState(false);

  const chatEndRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function sendMessage(
    customMessage?: string
  ) {
    const messageToSend = (
      customMessage || input
    ).trim();

    if (!messageToSend || loading) {
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
        "/api/business-chat",
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
            "Aila Business AI could not respond."
        );
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            data?.message ||
            "Tell me more about your business.",
        },
      ]);
    } catch (error) {
      console.error(
        "Aila Business AI Error:",
        error
      );

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            "I could not connect to Business Intelligence right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function resetConversation() {
    if (loading) {
      return;
    }

    setMessages([
      {
        role: "assistant",
        content:
          "Tell me about your business, idea or biggest operational challenge. I’ll help you identify the strongest opportunities for growth, AI and automation.",
      },
    ]);

    setInput("");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030303] text-white">
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:72px_72px]" />

      <div className="pointer-events-none absolute left-1/2 top-[-300px] h-[800px] w-[1000px] -translate-x-1/2 rounded-full bg-blue-500/[0.1] blur-[190px]" />

      <div className="pointer-events-none absolute right-[-300px] top-[850px] h-[600px] w-[600px] rounded-full bg-purple-500/[0.07] blur-[180px]" />

      {/* HERO */}
      <section className="relative mx-auto max-w-7xl px-6 pb-24 pt-36">
        <div className="max-w-5xl">
          <div className="inline-flex items-center gap-3 rounded-full border border-blue-300/15 bg-blue-300/[0.04] px-4 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />

              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
            </span>

            <span className="text-xs uppercase tracking-[0.24em] text-blue-200/70">
              Business Intelligence Online
            </span>
          </div>

          <p className="mt-10 text-sm uppercase tracking-[0.3em] text-neutral-600">
            Aila Ecosystem / Business AI
          </p>

          <h1 className="mt-6 max-w-5xl text-5xl font-semibold leading-[0.94] tracking-[-0.065em] sm:text-7xl lg:text-8xl">
            Understand the business.

            <span className="block bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
              Discover what comes next.
            </span>
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-neutral-400">
            Aila Business AI turns business
            challenges, ideas and inefficient
            operations into clearer opportunities
            for intelligent software, AI and
            automation.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#business-intelligence"
              className="rounded-full bg-white px-8 py-4 font-semibold text-black transition duration-300 hover:scale-105"
            >
              Analyze My Business
            </a>

            <Link
              href="/#start-project"
              className="rounded-full border border-white/[0.1] bg-white/[0.03] px-8 py-4 text-neutral-300 transition duration-300 hover:bg-white/[0.07]"
            >
              Build With Aila
            </Link>
          </div>
        </div>

        {/* HERO SIGNALS */}
        <div className="mt-20 grid gap-px overflow-hidden rounded-[32px] border border-white/[0.07] bg-white/[0.07] sm:grid-cols-3">
          {[
            {
              label: "Mode",
              value: "Live Discovery",
            },
            {
              label: "Focus",
              value: "Business Opportunity",
            },
            {
              label: "Output",
              value: "Practical Next Move",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-[#070707] px-6 py-6"
            >
              <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-700">
                {item.label}
              </p>

              <p className="mt-3 text-sm text-neutral-300">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* LIVE INTELLIGENCE */}
      <section
        id="business-intelligence"
        className="relative mx-auto max-w-7xl px-6 py-20"
      >
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-blue-300/60">
              Live Intelligence Workspace
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Think with Aila.
            </h2>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-full border border-green-400/10 bg-green-400/[0.04] px-4 py-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />

              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-400" />
            </span>

            <span className="text-[9px] uppercase tracking-[0.18em] text-green-300/60">
              Intelligence Active
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
          {/* DISCOVERY PANEL */}
          <div className="rounded-[36px] border border-white/[0.09] bg-[#080808]/90 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:p-8">
            <div className="flex items-center gap-4">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-300/15 bg-blue-300/[0.05]">
                <div className="absolute h-6 w-6 rounded-full bg-blue-300/[0.12] blur-lg" />

                <div className="relative h-2.5 w-2.5 rounded-full bg-blue-300 shadow-[0_0_20px_rgba(147,197,253,0.95)]" />
              </div>

              <div>
                <p className="text-sm font-medium">
                  Business Discovery
                </p>

                <p className="mt-1 text-xs text-neutral-600">
                  Intelligence starts with context
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              {discoverySteps.map((step) => (
                <div
                  key={step.number}
                  className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition hover:border-blue-300/15 hover:bg-blue-300/[0.025]"
                >
                  <div className="flex items-start gap-4">
                    <span className="pt-0.5 text-[10px] text-neutral-700">
                      {step.number}
                    </span>

                    <div>
                      <p className="text-sm text-neutral-300">
                        {step.title}
                      </p>

                      <p className="mt-2 text-xs leading-5 text-neutral-600">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-blue-300/10 bg-blue-300/[0.035] p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-300/50">
                Aila Insight
              </p>

              <p className="mt-3 text-sm leading-7 text-neutral-400">
                The strongest opportunities often
                appear where work is repetitive,
                fragmented, slow or difficult to
                scale.
              </p>
            </div>
          </div>

          {/* AI WORKSPACE */}
          <div className="overflow-hidden rounded-[36px] border border-white/[0.09] bg-[#080808]/90 shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-5 sm:px-8">
              <div className="flex items-center gap-4">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.05]">
                  <div className="absolute h-5 w-5 rounded-full bg-cyan-300/[0.1] blur-md" />

                  <div className="relative h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.9)]" />
                </div>

                <div>
                  <p className="text-sm font-medium">
                    Aila Business AI
                  </p>

                  <p className="mt-1 text-xs text-neutral-600">
                    Strategic intelligence workspace
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={resetConversation}
                disabled={loading}
                className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-[9px] uppercase tracking-[0.16em] text-neutral-600 transition hover:border-blue-300/20 hover:text-white disabled:opacity-30"
              >
                New Analysis
              </button>
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
                      className={`max-w-[90%] whitespace-pre-wrap rounded-3xl px-5 py-4 text-sm leading-7 sm:max-w-[80%] ${
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
                    <div className="flex gap-1">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-300" />

                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300 [animation-delay:150ms]" />

                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-300 [animation-delay:300ms]" />
                    </div>

                    <span className="text-xs text-neutral-600">
                      Aila is analyzing
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
                        sendMessage(suggestion)
                      }
                      disabled={loading}
                      className="rounded-full border border-white/[0.08] bg-white/[0.025] px-4 py-2 text-xs text-neutral-500 transition hover:border-blue-300/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {suggestion}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* INPUT */}
            <div className="p-5 sm:p-8">
              <div className="flex gap-2 rounded-2xl border border-white/[0.09] bg-black/40 p-2 transition focus-within:border-blue-300/25">
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
                  placeholder="Describe your business or biggest challenge..."
                  disabled={loading}
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-700 disabled:opacity-50"
                />

                <button
                  type="button"
                  onClick={() => sendMessage()}
                  disabled={
                    loading || !input.trim()
                  }
                  className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  {loading ? "..." : "Analyze"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT THINKS */}
      <section className="relative mx-auto max-w-7xl px-6 py-28">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300/60">
            Intelligence Process
          </p>

          <h2 className="mt-6 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
            From business problem

            <span className="block text-neutral-600">
              to practical opportunity.
            </span>
          </h2>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-[36px] border border-white/[0.07] bg-white/[0.07] lg:grid-cols-4">
          {discoverySteps.map((step) => (
            <div
              key={step.number}
              className="group bg-[#070707] p-7 transition duration-500 hover:bg-blue-300/[0.035]"
            >
              <span className="text-xs text-neutral-700">
                {step.number}
              </span>

              <h3 className="mt-16 text-xl font-medium">
                {step.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-neutral-500">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CAPABILITIES */}
      <section className="relative mx-auto max-w-7xl px-6 py-28">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-300/60">
              Intelligence Layer
            </p>

            <h2 className="mt-6 max-w-lg text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
              AI built around

              <span className="block text-neutral-600">
                real business.
              </span>
            </h2>

            <p className="mt-7 max-w-md leading-8 text-neutral-500">
              Every organization works differently.
              Aila discovers what matters before
              recommending software, AI or automation.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {capabilities.map((capability) => (
              <div
                key={capability.title}
                className="group rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-7 transition duration-500 hover:-translate-y-1 hover:border-blue-300/20 hover:bg-blue-300/[0.035]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-700">
                    {capability.number}
                  </span>

                  <div className="h-2 w-2 rounded-full border border-neutral-700 transition group-hover:border-blue-300 group-hover:bg-blue-300 group-hover:shadow-[0_0_15px_rgba(147,197,253,0.8)]" />
                </div>

                <h3 className="mt-12 text-xl font-medium">
                  {capability.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-neutral-500">
                  {capability.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative mx-auto max-w-6xl px-6 py-32">
        <div className="relative overflow-hidden rounded-[40px] border border-white/[0.09] bg-white/[0.025] px-6 py-20 text-center backdrop-blur-2xl sm:px-12">
          <div className="pointer-events-none absolute left-1/2 top-[-300px] h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-blue-500/[0.12] blur-[170px]" />

          <div className="relative">
            <p className="text-xs uppercase tracking-[0.3em] text-blue-300/60">
              Build Smarter
            </p>

            <h2 className="mx-auto mt-6 max-w-4xl text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
              Intelligence should lead

              <span className="block text-neutral-600">
                to something real.
              </span>
            </h2>

            <p className="mx-auto mt-7 max-w-xl leading-8 text-neutral-400">
              Discover the opportunity with Aila,
              then turn it into intelligent software,
              automation or a custom digital product.
            </p>

            <Link
              href="/#start-project"
              className="mt-10 inline-flex rounded-full bg-white px-9 py-4 font-semibold text-black transition duration-300 hover:scale-105"
            >
              Start a Business AI Project
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}