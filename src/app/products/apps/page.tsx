import Link from "next/link";

const capabilities = [
  ["01", "Mobile Applications", "Premium iOS and Android experiences built around real customer and business needs."],
  ["02", "Business Applications", "Internal tools, portals and operational systems that help teams work more effectively."],
  ["03", "AI-Powered Apps", "Applications with intelligent assistants, recommendations, document understanding and automation."],
  ["04", "Connected Products", "Apps connected to APIs, databases, payments, notifications and business workflows."],
];

const appTypes = [
  "iOS applications",
  "Android applications",
  "Customer platforms",
  "Business tools",
  "AI-powered products",
  "Custom software",
];

export default function AilaAppsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030303] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="pointer-events-none absolute left-1/2 top-[-350px] h-[900px] w-[1100px] -translate-x-1/2 rounded-full bg-violet-500/[0.08] blur-[200px]" />

      <section className="relative mx-auto max-w-7xl px-6 pb-24 pt-36">
        <div className="max-w-5xl">
          <div className="inline-flex items-center gap-3 rounded-full border border-violet-300/15 bg-violet-300/[0.04] px-4 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-300 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-300" />
            </span>
            <span className="text-[10px] uppercase tracking-[0.22em] text-violet-200/60">
              AilaApps
            </span>
          </div>

          <h1 className="mt-8 max-w-5xl text-5xl font-semibold tracking-[-0.06em] sm:text-7xl lg:text-[96px] lg:leading-[0.95]">
            Ideas become
            <span className="block bg-gradient-to-r from-violet-200 via-white to-cyan-300 bg-clip-text text-transparent">
              intelligent products.
            </span>
          </h1>

          <p className="mt-8 max-w-2xl text-base leading-8 text-neutral-500 sm:text-lg">
            AilaApps designs and builds mobile applications, business software
            and AI-powered digital products for ambitious ideas.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/#start-project"
              className="rounded-2xl bg-white px-7 py-4 text-center text-sm font-semibold text-black transition hover:scale-[1.02]"
            >
              Build an App
            </Link>

            <Link
              href="/products/sites"
              className="rounded-2xl border border-white/[0.09] bg-white/[0.025] px-7 py-4 text-center text-sm text-neutral-400 transition hover:border-white/20 hover:text-white"
            >
              Explore AilaSites
            </Link>
          </div>
        </div>
      </section>

      <section className="relative border-y border-white/[0.07] bg-white/[0.015]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 md:grid-cols-3">
          {[
            ["Platforms", "iOS + Android"],
            ["Experience", "Premium by design"],
            ["Intelligence", "Built into the product"],
          ].map(([title, value]) => (
            <div key={title}>
              <p className="text-xs uppercase tracking-[0.22em] text-neutral-700">{title}</p>
              <p className="mt-3 text-lg text-neutral-300">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 py-28">
        <p className="text-xs uppercase tracking-[0.25em] text-violet-300/50">
          Capabilities
        </p>

        <h2 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
          Software designed around what you want to achieve.
        </h2>

        <div className="mt-16 grid gap-4 md:grid-cols-2">
          {capabilities.map(([number, title, description]) => (
            <div
              key={number}
              className="rounded-[30px] border border-white/[0.07] bg-white/[0.025] p-7 transition hover:border-violet-300/15 hover:bg-white/[0.04] sm:p-9"
            >
              <p className="text-xs text-violet-300/40">{number}</p>
              <h3 className="mt-12 text-2xl font-medium tracking-[-0.03em]">{title}</h3>
              <p className="mt-4 max-w-md text-sm leading-7 text-neutral-500">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-28">
        <div className="overflow-hidden rounded-[36px] border border-white/[0.08] bg-[#080808]">
          <div className="grid lg:grid-cols-2">
            <div className="border-b border-white/[0.07] p-8 sm:p-12 lg:border-b-0 lg:border-r">
              <p className="text-xs uppercase tracking-[0.25em] text-violet-300/50">
                What we build
              </p>
              <h2 className="mt-6 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
                From first concept to real product.
              </h2>
              <p className="mt-6 max-w-lg text-sm leading-8 text-neutral-500">
                AilaApps turns product ideas into polished applications built
                for customers, teams and growing businesses.
              </p>
            </div>

            <div className="grid sm:grid-cols-2">
              {appTypes.map((item) => (
                <div
                  key={item}
                  className="flex min-h-32 items-center border-b border-white/[0.07] px-8 text-sm text-neutral-400"
                >
                  <span className="mr-4 h-1.5 w-1.5 rounded-full bg-violet-300/50" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-32">
        <div className="relative overflow-hidden rounded-[40px] border border-violet-300/10 bg-gradient-to-br from-violet-300/[0.06] via-white/[0.02] to-cyan-400/[0.04] p-8 sm:p-12 lg:p-16">
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-violet-300/50">
                Build with AilaApps
              </p>
              <h2 className="mt-6 max-w-3xl text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
                Your next application starts here.
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
