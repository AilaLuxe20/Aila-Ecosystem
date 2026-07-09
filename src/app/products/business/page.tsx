import Link from "next/link";

const capabilities = [
  {
    number: "01",
    title: "Business Intelligence",
    description:
      "Turn business information into clear insights, patterns and opportunities for better decisions.",
  },
  {
    number: "02",
    title: "AI Assistants",
    description:
      "Create intelligent assistants that support teams, customers and daily business operations.",
  },
  {
    number: "03",
    title: "Workflow Intelligence",
    description:
      "Identify repetitive processes and transform them into smarter, more efficient digital workflows.",
  },
  {
    number: "04",
    title: "Customer Intelligence",
    description:
      "Understand customer needs, improve experiences and create more intelligent interactions.",
  },
];

const activity = [
  {
    label: "Customer requests analyzed",
    value: "2,481",
    change: "+18.4%",
  },
  {
    label: "Workflows optimized",
    value: "127",
    change: "+24.1%",
  },
  {
    label: "Hours automated",
    value: "864",
    change: "+31.7%",
  },
];

const chartBars = [
  "h-7",
  "h-11",
  "h-9",
  "h-16",
  "h-12",
  "h-20",
  "h-16",
  "h-24",
  "h-20",
  "h-28",
  "h-24",
  "h-32",
];

export default function AilaBusinessPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030303] text-white">
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px]" />

      <div className="pointer-events-none absolute left-1/2 top-[-250px] h-[700px] w-[900px] -translate-x-1/2 rounded-full bg-blue-500/[0.1] blur-[180px]" />

      <div className="pointer-events-none absolute right-[-250px] top-[600px] h-[500px] w-[500px] rounded-full bg-purple-500/[0.08] blur-[160px]" />

      {/* HERO */}
      <section className="relative mx-auto grid min-h-screen max-w-7xl gap-16 px-6 pb-24 pt-36 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
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

          <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[0.95] tracking-[-0.06em] sm:text-7xl lg:text-8xl">
            Smarter systems.

            <span className="block bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
              Better business.
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-8 text-neutral-400">
            Aila Business AI helps organizations understand information,
            improve workflows and build intelligent systems around the way
            they work.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/#start-project"
              className="rounded-full bg-white px-8 py-4 font-semibold text-black transition duration-300 hover:scale-105"
            >
              Build with Aila
            </Link>

            <Link
              href="/#products"
              className="rounded-full border border-white/[0.1] bg-white/[0.03] px-8 py-4 text-neutral-300 transition duration-300 hover:bg-white/[0.07]"
            >
              Explore Ecosystem
            </Link>
          </div>
        </div>

        {/* AI BUSINESS DASHBOARD */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 rounded-full bg-blue-500/[0.08] blur-[100px]" />

          <div className="relative overflow-hidden rounded-[36px] border border-white/[0.09] bg-[#080808]/90 shadow-[0_40px_120px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
            {/* DASHBOARD HEADER */}
            <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-5 sm:px-8">
              <div>
                <p className="text-sm font-medium">
                  Business Intelligence
                </p>

                <p className="mt-1 text-xs text-neutral-600">
                  Live organization overview
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-green-400/10 bg-green-400/[0.04] px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]" />

                <span className="text-[9px] uppercase tracking-[0.18em] text-green-300/60">
                  Live
                </span>
              </div>
            </div>

            {/* DASHBOARD CONTENT */}
            <div className="p-6 sm:p-8">
              <div className="grid gap-3 sm:grid-cols-3">
                {activity.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"
                  >
                    <p className="text-xs leading-5 text-neutral-600">
                      {item.label}
                    </p>

                    <p className="mt-4 text-2xl font-semibold tracking-[-0.04em]">
                      {item.value}
                    </p>

                    <p className="mt-2 text-xs text-green-400/70">
                      {item.change}
                    </p>
                  </div>
                ))}
              </div>

              {/* INTELLIGENCE GRAPH */}
              <div className="mt-4 overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.02] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-300">
                      Intelligence Activity
                    </p>

                    <p className="mt-1 text-xs text-neutral-600">
                      Last 7 days
                    </p>
                  </div>

                  <span className="text-xs text-blue-300/60">
                    +27.8%
                  </span>
                </div>

                <div className="mt-8 flex h-40 items-end gap-2">
                  {chartBars.map((heightClass, index) => (
                    <div
                      key={`${heightClass}-${index}`}
                      className={`group flex flex-1 items-end ${heightClass}`}
                    >
                      <div className="h-full w-full rounded-t-md bg-gradient-to-t from-blue-500/20 to-cyan-300/70 transition duration-300 group-hover:to-cyan-200" />
                    </div>
                  ))}
                </div>
              </div>

              {/* AI INSIGHT */}
              <div className="mt-4 rounded-3xl border border-blue-300/10 bg-blue-300/[0.035] p-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-300/10 bg-cyan-300/[0.04]">
                    <div className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.9)]" />
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/50">
                      Aila Insight
                    </p>

                    <p className="mt-3 text-sm leading-7 text-neutral-400">
                      Customer response demand is increasing. Automating the
                      highest-volume requests could improve response capacity
                      and reduce repetitive workload.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                your business.
              </span>
            </h2>

            <p className="mt-7 max-w-md leading-8 text-neutral-500">
              Every organization works differently. Aila Business AI is
              designed around real operations, real information and real
              opportunities for improvement.
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
              What could intelligence

              <span className="block text-neutral-600">
                change in your business?
              </span>
            </h2>

            <p className="mx-auto mt-7 max-w-xl leading-8 text-neutral-400">
              Tell Aila how your business works and discover where intelligent
              software can create the most value.
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