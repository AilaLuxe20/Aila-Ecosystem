import Link from "next/link";

const flowSteps = [
  ["01", "Connect", "Bring your business tools, data and processes into one connected environment."],
  ["02", "Understand", "See how information moves across your business and where work becomes disconnected."],
  ["03", "Orchestrate", "Create intelligent rules that decide what should happen next."],
  ["04", "Move", "Automatically route information, actions and updates between systems."],
];

const capabilities = [
  "Connected business workflows",
  "Cross-system data movement",
  "Customer journey orchestration",
  "Operational process design",
  "Intelligent routing",
  "Real-time business actions",
];

export default function AilaFlowPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030303] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="pointer-events-none absolute left-1/2 top-[-350px] h-[900px] w-[1100px] -translate-x-1/2 rounded-full bg-blue-500/[0.08] blur-[200px]" />

      <section className="relative mx-auto max-w-7xl px-6 pb-24 pt-36">
        <div className="max-w-5xl">
          <div className="inline-flex items-center gap-3 rounded-full border border-blue-300/15 bg-blue-300/[0.04] px-4 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-300 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-300" />
            </span>
            <span className="text-[10px] uppercase tracking-[0.22em] text-blue-200/60">
              AilaFlow
            </span>
          </div>

          <h1 className="mt-8 max-w-5xl text-5xl font-semibold tracking-[-0.06em] sm:text-7xl lg:text-[96px] lg:leading-[0.95]">
            Your business,
            <span className="block bg-gradient-to-r from-blue-200 via-white to-cyan-300 bg-clip-text text-transparent">
              moving as one.
            </span>
          </h1>

          <p className="mt-8 max-w-2xl text-base leading-8 text-neutral-500 sm:text-lg">
            AilaFlow connects business processes, information and systems so work
            can move intelligently from one action to the next.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/#start-project"
              className="rounded-2xl bg-white px-7 py-4 text-center text-sm font-semibold text-black transition hover:scale-[1.02]"
            >
              Build a Connected System
            </Link>

            <Link
              href="/products/automation"
              className="rounded-2xl border border-white/[0.09] bg-white/[0.025] px-7 py-4 text-center text-sm text-neutral-400 transition hover:border-white/20 hover:text-white"
            >
              Explore Automation
            </Link>
          </div>
        </div>
      </section>

      <section className="relative border-y border-white/[0.07] bg-white/[0.015]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 md:grid-cols-3">
          {[
            ["Systems", "Connected"],
            ["Processes", "Orchestrated"],
            ["Information", "Always moving"],
          ].map(([title, value]) => (
            <div key={title}>
              <p className="text-xs uppercase tracking-[0.22em] text-neutral-700">{title}</p>
              <p className="mt-3 text-lg text-neutral-300">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 py-28">
        <p className="text-xs uppercase tracking-[0.25em] text-blue-300/50">
          How AilaFlow works
        </p>

        <h2 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
          From disconnected steps to one intelligent flow.
        </h2>

        <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {flowSteps.map(([number, title, description]) => (
            <div
              key={number}
              className="rounded-[30px] border border-white/[0.07] bg-white/[0.025] p-7 transition hover:border-blue-300/15 hover:bg-white/[0.04]"
            >
              <p className="text-xs text-blue-300/40">{number}</p>
              <h3 className="mt-12 text-2xl font-medium tracking-[-0.03em]">{title}</h3>
              <p className="mt-4 text-sm leading-7 text-neutral-500">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-28">
        <div className="overflow-hidden rounded-[36px] border border-white/[0.08] bg-[#080808]">
          <div className="grid lg:grid-cols-2">
            <div className="border-b border-white/[0.07] p-8 sm:p-12 lg:border-b-0 lg:border-r">
              <p className="text-xs uppercase tracking-[0.25em] text-blue-300/50">
                Connected operations
              </p>
              <h2 className="mt-6 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
                Stop making your business work in pieces.
              </h2>
              <p className="mt-6 max-w-lg text-sm leading-8 text-neutral-500">
                AilaFlow is designed for businesses where customers, teams, data
                and actions need to move across multiple processes.
              </p>
            </div>

            <div className="grid sm:grid-cols-2">
              {capabilities.map((item) => (
                <div
                  key={item}
                  className="flex min-h-32 items-center border-b border-white/[0.07] px-8 text-sm text-neutral-400"
                >
                  <span className="mr-4 h-1.5 w-1.5 rounded-full bg-blue-300/50" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-32">
        <div className="relative overflow-hidden rounded-[40px] border border-blue-300/10 bg-gradient-to-br from-blue-300/[0.06] via-white/[0.02] to-cyan-400/[0.04] p-8 sm:p-12 lg:p-16">
          <div className="pointer-events-none absolute right-[-150px] top-[-150px] h-96 w-96 rounded-full bg-blue-400/[0.08] blur-[120px]" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-blue-300/50">
                Build with AilaFlow
              </p>
              <h2 className="mt-6 max-w-3xl text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
                Connect the work your business depends on.
              </h2>
            </div>

            <Link
              href="/#start-project"
              className="shrink-0 rounded-2xl bg-white px-7 py-4 text-center text-sm font-semibold text-black transition hover:scale-[1.02]"
            >
              Start a Project
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
