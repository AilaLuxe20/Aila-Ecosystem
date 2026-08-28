"use client";

import Link from "next/link";
import ChatInterface from "@/components/ai/ChatInterface";

const commerceCapabilities = [
  {
    number: "01",
    title: "Product Catalog Management",
    description:
      "Organise products, manage inventory, and automate stock updates across all sales channels.",
  },
  {
    number: "02",
    title: "Intelligent Pricing",
    description:
      "Dynamic pricing strategies powered by AI to maximise revenue and competitiveness.",
  },
  {
    number: "03",
    title: "Order Processing",
    description:
      "End-to-end order management with automated fulfillment and shipping integration.",
  },
  {
    number: "04",
    title: "Analytics Dashboard",
    description:
      "Real-time commerce analytics with actionable insights for growth and optimisation.",
  },
];

const ecosystemNodes = [
  {
    title: "Aila Intelligence",
    description: "Core ecosystem intelligence",
    href: "/products/intelligence",
  },
  {
    title: "Aila Business AI",
    description: "Business intelligence",
    href: "/products/business",
  },
  {
    title: "Aila Sites",
    description: "Intelligent website builder",
    href: "/products/sites",
  },
];

export default function AilaCommercePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030303] text-white">
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px]" />

      <div className="pointer-events-none absolute left-1/2 top-[-350px] h-[900px] w-[1100px] -translate-x-1/2 rounded-full bg-emerald-500/[0.1] blur-[200px]" />

      <div className="pointer-events-none absolute right-[-300px] top-[700px] h-[600px] w-[600px] rounded-full bg-teal-500/[0.07] blur-[180px]" />

      {/* HERO */}
      <section className="relative mx-auto grid min-h-screen max-w-7xl gap-16 px-6 pb-24 pt-36 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-3 rounded-full border border-emerald-300/15 bg-emerald-300/[0.04] px-4 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />

              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>

            <span className="text-xs uppercase tracking-[0.24em] text-emerald-200/70">
              Commerce Online
            </span>
          </div>

          <p className="mt-10 text-sm uppercase tracking-[0.3em] text-neutral-600">
            Aila Ecosystem / Aila Commerce
          </p>

          <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[0.95] tracking-[-0.06em] sm:text-7xl lg:text-8xl">
            Sell smarter.

            <span className="block bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Grow faster.
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-8 text-neutral-400">
            Aila Commerce is an intelligent commerce platform
            that helps businesses build, manage, and scale
            online stores with AI-powered tools for catalog
            management, pricing, orders, and analytics.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/#start-project"
              className="rounded-full bg-white px-8 py-4 font-semibold text-black transition duration-300 hover:scale-105"
            >
              Start Selling
            </Link>

            <Link
              href="/#products"
              className="rounded-full border border-white/[0.1] bg-white/[0.03] px-8 py-4 text-neutral-300 transition duration-300 hover:bg-white/[0.07]"
            >
              Explore Ecosystem
            </Link>
          </div>
        </div>

        {/* COMMERCE CHAT */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 rounded-full bg-emerald-500/[0.08] blur-[110px]" />

          <ChatInterface
            mode="commerce"
            containerClassName="h-[600px]"
            messagesHeight="h-[400px]"
          />
        </div>
      </section>

      {/* ECOSYSTEM CONNECTIONS */}
      <section className="relative mx-auto max-w-7xl px-6 py-28">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/60">
            Connected Intelligence
          </p>

          <h2 className="mx-auto mt-6 max-w-4xl text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
            One core.

            <span className="block text-neutral-600">
              Multiple intelligent systems.
            </span>
          </h2>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {ecosystemNodes.map((node) => (
            <Link
              key={node.title}
              href={node.href}
              className="group rounded-[30px] border border-white/[0.08] bg-white/[0.025] p-7 transition duration-500 hover:-translate-y-1 hover:border-emerald-300/20 hover:bg-emerald-300/[0.035]"
            >
              <div className="flex items-center justify-between">
                <div className="h-2 w-2 rounded-full bg-emerald-300/50 transition group-hover:shadow-[0_0_16px_rgba(34,197,94,0.9)]" />

                <span className="text-neutral-700 transition group-hover:translate-x-1 group-hover:text-emerald-300">
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
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/60">
              Commerce Platform
            </p>

            <h2 className="mt-6 max-w-lg text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
              Commerce intelligence layer.

              <span className="block text-neutral-600">
                Built for growth.
              </span>
            </h2>

            <p className="mt-7 max-w-md leading-8 text-neutral-500">
              Aila Commerce provides intelligent tools for
              online stores, from product management and
              dynamic pricing to order processing and
              real-time analytics.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {commerceCapabilities.map((capability) => (
              <div
                key={capability.title}
                className="group rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-7 transition duration-500 hover:-translate-y-1 hover:border-emerald-300/20 hover:bg-emerald-300/[0.035]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-700">
                    {capability.number}
                  </span>

                  <div className="h-2 w-2 rounded-full border border-neutral-700 transition group-hover:border-emerald-300 group-hover:bg-emerald-300 group-hover:shadow-[0_0_15px_rgba(34,197,94,0.8)]" />
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
          <div className="pointer-events-none absolute left-1/2 top-[-300px] h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-emerald-500/[0.1] blur-[170px]" />

          <div className="relative">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/60">
              Begin with Aila Commerce
            </p>

            <h2 className="mx-auto mt-6 max-w-4xl text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
              Ready to sell?

              <span className="block text-neutral-600">
                Aila Commerce can help.
              </span>
            </h2>

            <p className="mx-auto mt-7 max-w-xl leading-8 text-neutral-400">
              Tell Aila Commerce about your products and
              start building your online store with
              intelligent tools for catalog, pricing,
              orders, and analytics.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/#start-project"
                className="inline-flex rounded-full bg-white px-10 py-4 font-semibold text-black transition hover:scale-105"
              >
                Start Your Project
              </Link>

              <Link
                href="/products/intelligence"
                className="inline-flex rounded-full border border-white/10 bg-white/5 px-10 py-4 font-semibold text-white transition hover:bg-white/10"
              >
                Explore Aila Intelligence
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
