import Link from "next/link";

export default function BuildWithAilaPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030303] text-white">
      <div className="absolute inset-0 -z-30 bg-[#030303]" />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px]" />

      <div className="absolute left-1/2 top-20 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[160px]" />

      <div className="mx-auto max-w-7xl px-6 py-32">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/70">
            Build With Aila
          </p>

          <h1 className="mt-6 text-5xl font-bold tracking-[-0.04em] sm:text-7xl">
            Turn your idea
            <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-500 bg-clip-text text-transparent">
              into a real product.
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-neutral-400">
            Aila builds AI-powered websites, web applications, mobile apps,
            intelligent automation systems and premium digital experiences.
            Tell us what you want to create and we will help you get there.
          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link
              href="/#start-project"
              className="rounded-full bg-white px-8 py-4 font-semibold text-black transition hover:scale-105"
            >
              Start a Project
            </Link>

            <Link
              href="/"
              className="rounded-full border border-white/10 bg-white/5 px-8 py-4 text-neutral-300 transition hover:bg-white/10"
            >
              Back to Ecosystem
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
