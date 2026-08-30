"use client";

import Link from "next/link";
import ChatInterface from "@/components/ai/ChatInterface";
import { PRODUCT_LIST } from "@/core/products/catalog";

const suggestions = [
  "Build me a premium website",
  "I need a mobile app",
  "Add AI to my business",
  "Automate repetitive work",
];

const capabilities = [
  {
    number: "01",
    title: "Project Intelligence",
    description:
      "Turn rough ideas into clear digital product concepts, features and development directions.",
  },
  {
    number: "02",
    title: "AI Guidance",
    description:
      "Explore where artificial intelligence can improve products, customer experiences and operations.",
  },
  {
    number: "03",
    title: "Product Discovery",
    description:
      "Identify the right combination of web, mobile, AI and automation for what you want to build.",
  },
  {
    number: "04",
    title: "Ecosystem Navigation",
    description:
      "Connect users with Aila Ads, AilaLegal AI, Business AI, Automation and custom software services.",
  },
];

const ecosystemNodes = PRODUCT_LIST.filter((product) => product.key !== "intelligence").map(
  (product) => ({
    title: product.title,
    description: product.description,
    href: product.href,
  }),
);

export default function AilaIntelligencePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030303] text-white">
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px]" />

      <div className="pointer-events-none absolute left-1/2 top-[-350px] h-[900px] w-[1100px] -translate-x-1/2 rounded-full bg-cyan-500/[0.1] blur-[200px]" />

      <div className="pointer-events-none absolute right-[-300px] top-[700px] h-[600px] w-[600px] rounded-full bg-purple-500/[0.07] blur-[180px]" />

      {/* HERO */}
      <section className="relative mx-auto grid min-h-screen max-w-7xl gap-16 px-6 pb-24 pt-36 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/15 bg-cyan-300/[0.04] px-4 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />

              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
            </span>

            <span className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">
              Core Intelligence Online
            </span>
          </div>

          <p className="mt-10 text-sm uppercase tracking-[0.3em] text-neutral-600">
            Aila Ecosystem / Intelligence
          </p>

          <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[0.95] tracking-[-0.06em] sm:text-7xl lg:text-8xl">
            One intelligence.

            <span className="block bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-400 bg-clip-text text-transparent">
              An entire ecosystem.
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-8 text-neutral-400">
            Aila Intelligence is the core layer
            connecting ideas, products, AI systems
            and intelligent digital experiences
            across the Aila Ecosystem.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/#start-project"
              className="rounded-full bg-white px-8 py-4 font-semibold text-black transition duration-300 hover:scale-105"
            >
              Start a Project
            </Link>

            <Link
              href="/#products"
              className="rounded-full border border-white/[0.1] bg-white/[0.03] px-8 py-4 text-neutral-300 transition duration-300 hover:bg-white/[0.07]"
            >
              Explore Ecosystem
            </Link>
          </div>
        </div>

        {/* LIVE INTELLIGENCE */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 rounded-full bg-cyan-500/[0.08] blur-[110px]" />

          <ChatInterface
            mode="intelligence"
            containerClassName="h-[600px]"
            messagesHeight="h-[400px]"
            suggestions={suggestions}
            showConversationHistory
          />
        </div>
      </section>

      {/* ECOSYSTEM CONNECTIONS */}
      <section className="relative mx-auto max-w-7xl px-6 py-28">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/60">
            Connected Intelligence
          </p>

          <h2 className="mx-auto mt-6 max-w-4xl text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
            One core.

            <span className="block text-neutral-600">
              Multiple intelligent systems.
            </span>
          </h2>
        </div>

          <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ecosystemNodes.map((node) => (
            <Link
              key={node.title}
              href={node.href}
              className="group rounded-[30px] border border-white/[0.08] bg-white/[0.025] p-7 transition duration-500 hover:-translate-y-1 hover:border-cyan-300/20 hover:bg-cyan-300/[0.035]"
            >
              <div className="flex items-center justify-between">
                <div className="h-2 w-2 rounded-full bg-cyan-300/50 transition group-hover:shadow-[0_0_16px_rgba(103,232,249,0.9)]" />

                <span className="text-neutral-700 transition group-hover:translate-x-1 group-hover:text-cyan-300">
                  →
                </span>
              </div>

              <h3 className="mt-12 text-xl font-medium">
                {node.title}
              </h3>

              <p className="mt-3 text-sm text-neutral-600">
                {node.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* CAPABILITIES */}
      <section className="relative mx-auto max-w-7xl px-6 py-28">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/60">
              Intelligence Layer
            </p>

            <h2 className="mt-6 max-w-lg text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
              Start with an idea.

              <span className="block text-neutral-600">
                Build what comes next.
              </span>
            </h2>

            <p className="mt-7 max-w-md leading-8 text-neutral-500">
              Aila helps transform ideas into
              clearer products, intelligent
              systems and real digital
              experiences.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {capabilities.map((capability) => (
              <div
                key={capability.title}
                className="group rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-7 transition duration-500 hover:-translate-y-1 hover:border-cyan-300/20 hover:bg-cyan-300/[0.035]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-700">
                    {capability.number}
                  </span>

                  <div className="h-2 w-2 rounded-full border border-neutral-700 transition group-hover:border-cyan-300 group-hover:bg-cyan-300 group-hover:shadow-[0_0_15px_rgba(103,232,249,0.8)]" />
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
          <div className="pointer-events-none absolute left-1/2 top-[-300px] h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-cyan-500/[0.1] blur-[170px]" />

          <div className="relative">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/60">
              Begin with Aila
            </p>

            <h2 className="mx-auto mt-6 max-w-4xl text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
              Your next idea can become

              <span className="block text-neutral-600">
                a real intelligent product.
              </span>
            </h2>

            <p className="mx-auto mt-7 max-w-xl leading-8 text-neutral-400">
              Tell Aila what you want to create
              and start turning the idea into a
              real website, application, AI
              solution or automation system.
            </p>

            <Link
              href="/#start-project"
              className="mt-10 inline-flex rounded-full bg-white px-9 py-4 font-semibold text-black transition duration-300 hover:scale-105"
            >
              Start Your Project
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
