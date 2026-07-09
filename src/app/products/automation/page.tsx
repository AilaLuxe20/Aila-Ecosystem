import Link from "next/link";

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

const automationSteps = [
  {
    label: "New request received",
    status: "Complete",
  },
  {
    label: "Aila classified request",
    status: "Complete",
  },
  {
    label: "Customer data enriched",
    status: "Complete",
  },
  {
    label: "Workflow assigned",
    status: "Running",
  },
];

const metrics = [
  {
    value: "1,284",
    label: "Tasks automated",
  },
  {
    value: "96.8%",
    label: "Success rate",
  },
  {
    value: "412h",
    label: "Time recovered",
  },
];

export default function AilaAutomationPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030303] text-white">
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px]" />

      <div className="pointer-events-none absolute left-1/2 top-[-300px] h-[800px] w-[1000px] -translate-x-1/2 rounded-full bg-purple-500/[0.1] blur-[190px]" />

      <div className="pointer-events-none absolute left-[-300px] top-[700px] h-[600px] w-[600px] rounded-full bg-cyan-500/[0.06] blur-[180px]" />

      {/* HERO */}
      <section className="relative mx-auto grid min-h-screen max-w-7xl gap-16 px-6 pb-24 pt-36 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-3 rounded-full border border-purple-300/15 bg-purple-300/[0.04] px-4 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-60" />

              <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-400" />
            </span>

            <span className="text-xs uppercase tracking-[0.24em] text-purple-200/70">
              Automation Engine Online
            </span>
          </div>

          <p className="mt-10 text-sm uppercase tracking-[0.3em] text-neutral-600">
            Aila Ecosystem / Automation
          </p>

          <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[0.95] tracking-[-0.06em] sm:text-7xl lg:text-8xl">
            Work flows.

            <span className="block bg-gradient-to-r from-purple-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent">
              Intelligence moves.
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-8 text-neutral-400">
            Aila Automation transforms repetitive business processes into
            intelligent systems that move information, complete tasks and keep
            operations running.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/#start-project"
              className="rounded-full bg-white px-8 py-4 font-semibold text-black transition duration-300 hover:scale-105"
            >
              Automate with Aila
            </Link>

            <Link
              href="/#products"
              className="rounded-full border border-white/[0.1] bg-white/[0.03] px-8 py-4 text-neutral-300 transition duration-300 hover:bg-white/[0.07]"
            >
              Explore Ecosystem
            </Link>
          </div>
        </div>

        {/* AUTOMATION ENGINE */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 rounded-full bg-purple-500/[0.08] blur-[110px]" />

          <div className="relative overflow-hidden rounded-[36px] border border-white/[0.09] bg-[#080808]/90 shadow-[0_40px_120px_rgba(0,0,0,0.65)] backdrop-blur-2xl">
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-5 sm:px-8">
              <div>
                <p className="text-sm font-medium">
                  Intelligent Workflow
                </p>

                <p className="mt-1 text-xs text-neutral-600">
                  Customer request automation
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-green-400/10 bg-green-400/[0.04] px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]" />

                <span className="text-[9px] uppercase tracking-[0.18em] text-green-300/60">
                  Running
                </span>
              </div>
            </div>

            {/* ENGINE BODY */}
            <div className="p-6 sm:p-8">
              <div className="grid gap-3 sm:grid-cols-3">
                {metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"
                  >
                    <p className="text-2xl font-semibold tracking-[-0.04em]">
                      {metric.value}
                    </p>

                    <p className="mt-2 text-xs text-neutral-600">
                      {metric.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* WORKFLOW */}
              <div className="mt-4 rounded-3xl border border-white/[0.07] bg-white/[0.02] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-300">
                      Active Sequence
                    </p>

                    <p className="mt-1 text-xs text-neutral-600">
                      Workflow ID · AILA-2841
                    </p>
                  </div>

                  <span className="text-xs text-purple-300/60">
                    75%
                  </span>
                </div>

                <div className="mt-7 space-y-3">
                  {automationSteps.map((step, index) => {
                    const isRunning =
                      step.status === "Running";

                    return (
                      <div
                        key={step.label}
                        className="group flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-black/30 p-4 transition duration-300 hover:border-purple-300/15"
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-xs ${
                            isRunning
                              ? "border-purple-300/20 bg-purple-300/[0.06] text-purple-300"
                              : "border-green-300/15 bg-green-300/[0.04] text-green-400"
                          }`}
                        >
                          {isRunning ? "•••" : "✓"}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-neutral-300">
                            {step.label}
                          </p>

                          <p
                            className={`mt-1 text-xs ${
                              isRunning
                                ? "text-purple-300/60"
                                : "text-neutral-700"
                            }`}
                          >
                            {step.status}
                          </p>
                        </div>

                        <span className="text-xs text-neutral-700">
                          0{index + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AILA AUTOMATION INSIGHT */}
              <div className="mt-4 rounded-3xl border border-purple-300/10 bg-purple-300/[0.035] p-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-purple-300/10 bg-purple-300/[0.04]">
                    <div className="h-2 w-2 rounded-full bg-purple-300 shadow-[0_0_14px_rgba(216,180,254,0.9)]" />
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-purple-300/50">
                      Aila Automation
                    </p>

                    <p className="mt-3 text-sm leading-7 text-neutral-400">
                      The request has been classified and enriched. Aila is now
                      routing it to the correct workflow without manual
                      intervention.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AUTOMATION FLOW */}
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
                "Aila analyzes the information and determines what should happen next.",
            },
            {
              number: "03",
              title: "Act",
              description:
                "Connected systems, tools and AI agents complete the required tasks.",
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
              className="group relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-7 transition duration-500 hover:-translate-y-1 hover:border-purple-300/20 hover:bg-purple-300/[0.035]"
            >
              <div className="pointer-events-none absolute right-[-50px] top-[-50px] h-32 w-32 rounded-full bg-purple-500/[0.06] blur-[50px] transition duration-500 group-hover:bg-purple-500/[0.12]" />

              <div className="relative">
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
              Aila connects the processes behind your business and turns
              repetitive work into intelligent digital systems.
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

                  <div className="h-2 w-2 rounded-full border border-neutral-700 transition group-hover:border-purple-300 group-hover:bg-purple-300 group-hover:shadow-[0_0_15px_rgba(216,180,254,0.8)]" />
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

      {/* FINAL CTA */}
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
              Show Aila the repetitive work inside your business and build an
              intelligent system that handles it.
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