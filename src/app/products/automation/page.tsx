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

const workflows = [
  {
    number: "01",
    title: "Lead Automation",
    description:
      "Capture inquiries, qualify opportunities and route leads into the right business workflow automatically.",
  },
  {
    number: "02",
    title: "Customer Operations",
    description:
      "Automate repetitive customer requests, notifications, follow-ups and service processes.",
  },
  {
    number: "03",
    title: "Internal Workflows",
    description:
      "Connect teams, approvals, documents and business processes through intelligent automated systems.",
  },
  {
    number: "04",
    title: "AI Agents",
    description:
      "Deploy intelligent agents that understand tasks, use tools and complete multi-step business workflows.",
  },
];

const suggestions = [
  "Automate my customer follow-ups",
  "I manually process documents",
  "Find repetitive work in my business",
  "Design an AI workflow",
];

const discoverySteps = [
  "Discover the trigger",
  "Understand the information",
  "Identify decisions and rules",
  "Design automated actions",
  "Define the desired result",
];

export default function AilaAutomationPage() {
  const [input, setInput] = useState("");

  const [messages, setMessages] = useState<
    Message[]
  >([
    {
      role: "assistant",
      content:
        "Tell me about a repetitive task or manual process in your business. I’ll help you turn it into a smarter connected workflow.",
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
        "/api/automation-chat",
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
            "Aila Automation could not respond."
        );
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            data?.message ||
            "Tell me more about the process you want to automate.",
        },
      ]);
    } catch (error) {
      console.error(
        "Aila Automation Error:",
        error
      );

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            "I could not connect to the automation engine right now. Please try again.",
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

      <div className="pointer-events-none absolute left-1/2 top-[-300px] h-[800px] w-[1000px] -translate-x-1/2 rounded-full bg-purple-500/[0.1] blur-[190px]" />

      <div className="pointer-events-none absolute left-[-300px] top-[900px] h-[600px] w-[600px] rounded-full bg-cyan-500/[0.06] blur-[180px]" />

      {/* HERO */}
      <section className="relative mx-auto max-w-7xl px-6 pb-20 pt-36">
        <div className="max-w-5xl">
          <div className="inline-flex items-center gap-3 rounded-full border border-purple-300/15 bg-purple-300/[0.04] px-4 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-400" />
            </span>

            <span className="text-xs uppercase tracking-[0.24em] text-purple-200/70">
              Automation Intelligence Online
            </span>
          </div>

          <p className="mt-10 text-sm uppercase tracking-[0.3em] text-neutral-600">
            Aila Ecosystem / Automation
          </p>

          <h1 className="mt-6 max-w-5xl text-5xl font-semibold leading-[0.95] tracking-[-0.06em] sm:text-7xl lg:text-8xl">
            Show Aila the work.

            <span className="block bg-gradient-to-r from-purple-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent">
              Build the workflow.
            </span>
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-neutral-400">
            Describe the repetitive work inside your
            business. Aila discovers the trigger,
            decisions, actions and intelligent workflow
            that could automate it.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#automation-workspace"
              className="rounded-full bg-white px-8 py-4 font-semibold text-black transition duration-300 hover:scale-105"
            >
              Discover My Workflow
            </a>

            <Link
              href="/#products"
              className="rounded-full border border-white/[0.1] bg-white/[0.03] px-8 py-4 text-neutral-300 transition duration-300 hover:bg-white/[0.07]"
            >
              Explore Ecosystem
            </Link>
          </div>
        </div>
      </section>

      {/* LIVE AUTOMATION WORKSPACE */}
      <section
        id="automation-workspace"
        className="relative mx-auto max-w-7xl px-6 py-16"
      >
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-purple-300/60">
              Live Workflow Discovery
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Turn repetition into a system.
            </h2>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-green-400/10 bg-green-400/[0.04] px-4 py-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-400" />
            </span>

            <span className="text-[9px] uppercase tracking-[0.18em] text-green-300/60">
              Engine Active
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          {/* DISCOVERY PANEL */}
          <div className="rounded-[36px] border border-white/[0.09] bg-[#080808]/90 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:p-8">
            <div className="flex items-center gap-4">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-300/15 bg-purple-300/[0.05]">
                <div className="absolute h-6 w-6 rounded-full bg-purple-300/[0.12] blur-lg" />
                <div className="relative h-2.5 w-2.5 rounded-full bg-purple-300 shadow-[0_0_20px_rgba(216,180,254,0.95)]" />
              </div>

              <div>
                <p className="text-sm font-medium">
                  Workflow Discovery
                </p>

                <p className="mt-1 text-xs text-neutral-600">
                  From manual process to intelligent system
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              {discoverySteps.map(
                (step, index) => (
                  <div
                    key={step}
                    className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
                  >
                    <span className="text-[10px] text-neutral-700">
                      0{index + 1}
                    </span>

                    <span className="text-sm text-neutral-400">
                      {step}
                    </span>
                  </div>
                )
              )}
            </div>

            <div className="mt-6 rounded-3xl border border-purple-300/10 bg-purple-300/[0.035] p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-purple-300/50">
                Aila Automation
              </p>

              <p className="mt-3 text-sm leading-7 text-neutral-400">
                The best automation opportunities often
                begin with work that repeats, moves
                information between systems or delays
                people unnecessarily.
              </p>
            </div>
          </div>

          {/* LIVE AI */}
          <div className="overflow-hidden rounded-[36px] border border-white/[0.09] bg-[#080808]/90 shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-5 sm:px-8">
              <div className="flex items-center gap-4">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-300/15 bg-purple-300/[0.05]">
                  <div className="absolute h-5 w-5 rounded-full bg-purple-300/[0.1] blur-md" />
                  <div className="relative h-2.5 w-2.5 rounded-full bg-purple-300 shadow-[0_0_18px_rgba(216,180,254,0.9)]" />
                </div>

                <div>
                  <p className="text-sm font-medium">
                    Aila Automation
                  </p>

                  <p className="mt-1 text-xs text-neutral-600">
                    Intelligent workflow architect
                  </p>
                </div>
              </div>

              <span className="hidden rounded-full border border-purple-300/10 bg-purple-300/[0.04] px-3 py-1.5 text-[9px] uppercase tracking-[0.16em] text-purple-300/60 sm:block">
                Live AI
              </span>
            </div>

            <div className="h-[500px] space-y-5 overflow-y-auto p-5 sm:p-8">
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
                      className={`max-w-[88%] whitespace-pre-wrap rounded-3xl px-5 py-4 text-sm leading-7 sm:max-w-[78%] ${
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
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-300" />
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-300 [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300 [animation-delay:300ms]" />
                    </div>

                    <span className="text-xs text-neutral-600">
                      Aila is designing the workflow
                    </span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

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
                      className="rounded-full border border-white/[0.08] bg-white/[0.025] px-4 py-2 text-xs text-neutral-500 transition hover:border-purple-300/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {suggestion}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="p-5 sm:p-8">
              <div className="flex gap-2 rounded-2xl border border-white/[0.09] bg-black/40 p-2 transition focus-within:border-purple-300/25">
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
                  placeholder="Describe repetitive work you want to automate..."
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
                  {loading ? "..." : "Discover"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FLOW */}
      <section className="relative mx-auto max-w-7xl px-6 py-28">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-purple-300/60">
            How Intelligence Moves
          </p>

          <h2 className="mx-auto mt-6 max-w-4xl text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
            From trigger to outcome.

            <span className="block text-neutral-600">
              Automatically.
            </span>
          </h2>
        </div>

        <div className="mt-20 grid gap-4 lg:grid-cols-4">
          {[
            {
              number: "01",
              title: "Trigger",
              description:
                "A request, action or business event starts the workflow.",
            },
            {
              number: "02",
              title: "Understand",
              description:
                "Aila analyzes information and determines what should happen next.",
            },
            {
              number: "03",
              title: "Act",
              description:
                "Connected systems and intelligent agents complete the required tasks.",
            },
            {
              number: "04",
              title: "Improve",
              description:
                "Results are tracked so workflows can become more intelligent over time.",
            },
          ].map((step) => (
            <div
              key={step.number}
              className="group rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-7 transition duration-500 hover:-translate-y-1 hover:border-purple-300/20 hover:bg-purple-300/[0.035]"
            >
              <span className="text-xs text-neutral-700">
                {step.number}
              </span>

              <div className="mt-12 h-px w-full bg-gradient-to-r from-purple-300/40 to-transparent" />

              <h3 className="mt-8 text-xl font-medium">
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
            <p className="text-sm uppercase tracking-[0.3em] text-purple-300/60">
              Automation Systems
            </p>

            <h2 className="mt-6 max-w-lg text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
              Less repetition.

              <span className="block text-neutral-600">
                More momentum.
              </span>
            </h2>

            <p className="mt-7 max-w-md leading-8 text-neutral-500">
              Aila connects the processes behind your
              business and turns repetitive work into
              intelligent digital systems.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {workflows.map((workflow) => (
              <div
                key={workflow.title}
                className="group rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-7 transition duration-500 hover:-translate-y-1 hover:border-purple-300/20 hover:bg-purple-300/[0.035]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-700">
                    {workflow.number}
                  </span>

                  <div className="h-2 w-2 rounded-full border border-neutral-700 transition group-hover:border-purple-300 group-hover:bg-purple-300" />
                </div>

                <h3 className="mt-12 text-xl font-medium">
                  {workflow.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-neutral-500">
                  {workflow.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-6xl px-6 py-32">
        <div className="relative overflow-hidden rounded-[40px] border border-white/[0.09] bg-white/[0.025] px-6 py-20 text-center backdrop-blur-2xl sm:px-12">
          <div className="pointer-events-none absolute left-1/2 top-[-300px] h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-purple-500/[0.12] blur-[170px]" />

          <div className="relative">
            <p className="text-xs uppercase tracking-[0.3em] text-purple-300/60">
              Automate What Slows You Down
            </p>

            <h2 className="mx-auto mt-6 max-w-4xl text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
              Your business should move

              <span className="block text-neutral-600">
                even when you are not.
              </span>
            </h2>

            <p className="mx-auto mt-7 max-w-xl leading-8 text-neutral-400">
              Show Aila the repetitive work inside your
              business and discover the intelligent system
              that could handle it.
            </p>

            <Link
              href="/#start-project"
              className="mt-10 inline-flex rounded-full bg-white px-9 py-4 font-semibold text-black transition duration-300 hover:scale-105"
            >
              Start an Automation Project
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}