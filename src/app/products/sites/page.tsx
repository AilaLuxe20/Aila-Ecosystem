"use client";

import Link from "next/link";
import { useState } from "react";

const capabilities = [
  ["01", "Intelligent Websites", "Premium websites designed around your business, customers and goals — not generic templates."],
  ["02", "AI Experiences", "Intelligent assistants, discovery systems and personalized interactions built directly into your digital experience."],
  ["03", "Web Applications", "Powerful platforms, portals, dashboards and customer-facing applications for real business operations."],
  ["04", "Connected Systems", "Forms, databases, payments, APIs and workflows connected into one intelligent digital system."],
];

const builds = [
  "Company websites",
  "AI-powered platforms",
  "Customer portals",
  "Booking systems",
  "E-commerce experiences",
  "Business dashboards",
];

export default function AilaSitesPage() {
  const [idea, setIdea] = useState("");

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030303] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="pointer-events-none absolute left-1/2 top-[-350px] h-[900px] w-[1100px] -translate-x-1/2 rounded-full bg-cyan-500/[0.08] blur-[200px]" />

      <section className="relative mx-auto max-w-7xl px-6 pb-24 pt-36">
        <div className="max-w-5xl">
          <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/15 bg-cyan-300/[0.04] px-4 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300" />
            </span>
            <span className="text-[10px] uppercase tracking-[0.22em] text-cyan-200/60">
              AilaSites
            </span>
          </div>

          <h1 className="mt-8 max-w-5xl text-5xl font-semibold tracking-[-0.06em] sm:text-7xl lg:text-[96px] lg:leading-[0.95]">
            Websites that
            <span className="block bg-gradient-to-r from-cyan-200 via-white to-blue-300 bg-clip-text text-transparent">
              think beyond pages.
            </span>
          </h1>

          <p className="mt-8 max-w-2xl text-base leading-8 text-neutral-500 sm:text-lg">
            AilaSites creates premium websites and web platforms that combine design,
            software and intelligence into experiences built for modern businesses.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href="#start-project"
              className="rounded-2xl bg-white px-7 py-4 text-center text-sm font-semibold text-black transition hover:scale-[1.02]"
            >
              Build with AilaSites
            </a>

            <Link
              href="/#products"
              className="rounded-2xl border border-white/[0.09] bg-white/[0.025] px-7 py-4 text-center text-sm text-neutral-400 transition hover:border-white/20 hover:text-white"
            >
              Explore Ecosystem
            </Link>
          </div>
        </div>
      </section>

      <section className="relative border-y border-white/[0.07] bg-white/[0.015]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-3">
          {[
            ["Design", "Premium digital experiences"],
            ["Technology", "Modern scalable software"],
            ["Intelligence", "AI where it creates value"],
          ].map(([title, text]) => (
            <div key={title}>
              <p className="text-xs uppercase tracking-[0.22em] text-neutral-700">
                {title}
              </p>
              <p className="mt-3 text-lg text-neutral-300">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 py-28">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/50">
          Capabilities
        </p>

        <h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
          More than a website.
        </h2>

        <div className="mt-16 grid gap-4 md:grid-cols-2">
          {capabilities.map(([number, title, description]) => (
            <div
              key={number}
              className="group rounded-[30px] border border-white/[0.07] bg-white/[0.025] p-7 transition hover:border-cyan-300/15 hover:bg-white/[0.04] sm:p-9"
            >
              <p className="text-xs text-cyan-300/40">{number}</p>
              <h3 className="mt-12 text-2xl font-medium tracking-[-0.03em]">
                {title}
              </h3>
              <p className="mt-4 max-w-md text-sm leading-7 text-neutral-500">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-28">
        <div className="overflow-hidden rounded-[36px] border border-white/[0.08] bg-[#080808]">
          <div className="grid lg:grid-cols-2">
            <div className="border-b border-white/[0.07] p-8 sm:p-12 lg:border-b-0 lg:border-r">
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/50">
                What we build
              </p>
              <h2 className="mt-6 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
                Digital products built around your idea.
              </h2>
            </div>

            <div className="grid sm:grid-cols-2">
              {builds.map((item) => (
                <div
                  key={item}
                  className="flex min-h-32 items-center border-b border-white/[0.07] px-8 text-sm text-neutral-400"
                >
                  <span className="mr-4 h-1.5 w-1.5 rounded-full bg-cyan-300/50" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="start-project" className="relative mx-auto max-w-7xl px-6 pb-32">
        <div className="rounded-[40px] border border-cyan-300/10 bg-gradient-to-br from-cyan-300/[0.06] via-white/[0.02] to-blue-400/[0.04] p-8 sm:p-12 lg:p-16">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/50">
                Start building
              </p>
              <h2 className="mt-6 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
                What do you want to create?
              </h2>
            </div>

            <div className="rounded-[30px] border border-white/[0.08] bg-black/30 p-4">
              <textarea
                value={idea}
                onChange={(event) => setIdea(event.target.value)}
                placeholder="I want to build..."
                rows={6}
                className="w-full resize-none bg-transparent p-4 text-sm leading-7 text-white outline-none placeholder:text-neutral-700"
              />

              <div className="mt-3 flex justify-end border-t border-white/[0.07] pt-4">
                <Link
                  href={
                    idea.trim()
                      ? `/?project=${encodeURIComponent(idea)}#start-project`
                      : "/#start-project"
                  }
                  className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-black"
                >
                  Start Project
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
