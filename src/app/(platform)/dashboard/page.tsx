import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030303] text-white">
      <div className="absolute inset-0 -z-30 bg-[#030303]" />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px]" />

      <div className="absolute left-1/2 top-20 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[160px]" />

      <div className="mx-auto max-w-7xl px-6 py-32">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/70">
            Aila Platform
          </p>

          <h1 className="mt-6 text-5xl font-bold tracking-[-0.04em] sm:text-7xl">
            Dashboard
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-neutral-400">
            Your intelligent workspace for the Aila Ecosystem.
            This dashboard is under construction.
          </p>

          <div className="mt-12">
            <Link
              href="/products/intelligence"
              className="rounded-full bg-white px-8 py-4 font-semibold text-black transition hover:scale-105"
            >
              Explore Aila Intelligence
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
