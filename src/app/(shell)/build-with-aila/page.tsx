import type { Metadata } from "next";
import Link from "next/link";

import ProjectInquiry from "@/components/forms/ProjectInquiry";

export const metadata: Metadata = {
  title: "Build With Aila",
  description:
    "Tell Aila Luxe what you want to build. Websites, applications, AI systems, and automation.",
  alternates: {
    canonical: "/build-with-aila",
  },
};

export default function BuildWithAilaPage() {
  return (
    <main className="relative min-h-screen overflow-x-clip overflow-y-visible bg-[#030303] text-white">
      <div className="absolute inset-0 -z-30 bg-[#030303]" />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="absolute left-1/2 top-20 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[160px]" />

      <div className="mx-auto max-w-7xl px-6 pb-16 pt-24">
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
            Aila Luxe builds AI-powered websites, web applications, mobile apps,
            automation systems, and digital products. Describe the project below.
          </p>
          <div className="mt-10">
            <Link
              href="/"
              className="rounded-full border border-white/10 bg-white/5 px-8 py-4 text-neutral-300 transition hover:bg-white/10"
            >
              Back to Ecosystem
            </Link>
          </div>
        </div>
      </div>

      <ProjectInquiry />
    </main>
  );
}
