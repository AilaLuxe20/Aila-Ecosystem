import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "Contact — Aila Ecosystem",
  description:
    "Get in touch with Aila Ecosystem. Start a project, ask a question, or explore what we can build together.",
};

const contactMethods = [
  {
    label: "WhatsApp",
    description: "Chat directly with the team",
    value: "+234 808 047 9490",
    href: "https://wa.me/2348080479490",
    external: true,
    accent: {
      dot: "bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.8)]",
      border: "hover:border-green-400/20",
      glow: "hover:bg-green-400/[0.03]",
      tag: "border-green-400/15 bg-green-400/[0.05] text-green-300",
    },
    tag: "Fastest response",
  },
  {
    label: "Email",
    description: "Send a detailed message",
    value: "ailaluxeventures@gmail.com",
    href: "mailto:ailaluxeventures@gmail.com",
    external: false,
    accent: {
      dot: "bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.8)]",
      border: "hover:border-cyan-300/20",
      glow: "hover:bg-cyan-300/[0.03]",
      tag: "border-cyan-300/15 bg-cyan-300/[0.05] text-cyan-200",
    },
    tag: "Within 24 hours",
  },
  {
    label: "Instagram",
    description: "Follow our work",
    value: "@ailaluxeventures",
    href: "https://www.instagram.com/ailaluxeventures?igsh=MXh5OW91cDk4d2lqbg==",
    external: true,
    accent: {
      dot: "bg-pink-400 shadow-[0_0_12px_rgba(244,114,182,0.8)]",
      border: "hover:border-pink-400/20",
      glow: "hover:bg-pink-400/[0.03]",
      tag: "border-pink-400/15 bg-pink-400/[0.05] text-pink-300",
    },
    tag: "Behind the scenes",
  },
  {
    label: "X (Twitter)",
    description: "Follow updates and news",
    value: "@ailaluxe",
    href: "https://x.com/ailaluxe?s=11",
    external: true,
    accent: {
      dot: "bg-neutral-300 shadow-[0_0_12px_rgba(212,212,212,0.5)]",
      border: "hover:border-neutral-400/20",
      glow: "hover:bg-neutral-400/[0.03]",
      tag: "border-neutral-400/15 bg-neutral-400/[0.05] text-neutral-300",
    },
    tag: "Latest updates",
  },
];

export default function ContactPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#030303] text-white">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-[-200px] h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-cyan-500/[0.05] blur-[160px]" />
          <div className="absolute bottom-[-200px] right-[-100px] h-[400px] w-[500px] rounded-full bg-violet-500/[0.04] blur-[140px]" />
        </div>

        <section className="relative mx-auto max-w-7xl px-6 pb-12 pt-40">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">
              Get in touch
            </p>

            <h1 className="mt-5 text-5xl font-semibold tracking-[-0.04em] sm:text-6xl md:text-7xl">
              Let&apos;s build
              <span className="block text-neutral-500">
                something real.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-neutral-400">
              Have a project in mind, a question about the
              ecosystem, or just want to explore what&apos;s
              possible? Reach out through any of the
              channels below.
            </p>
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {contactMethods.map((method) => (
              <a
                key={method.label}
                href={method.href}
                target={method.external ? "_blank" : undefined}
                rel={method.external ? "noopener noreferrer" : undefined}
                className={`group relative overflow-hidden rounded-3xl border border-white/[0.07] bg-[#080808]/60 p-7 backdrop-blur-xl transition duration-500 ${method.accent.border} ${method.accent.glow}`}
              >
                <div className="absolute left-8 right-8 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                <div className="mb-6 flex items-center justify-between">
                  <div className={`h-2 w-2 rounded-full ${method.accent.dot}`} />
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-widest ${method.accent.tag}`}
                  >
                    {method.tag}
                  </span>
                </div>

                <p className="text-base font-semibold text-white">
                  {method.label}
                </p>

                <p className="mt-1 text-xs text-neutral-600">
                  {method.description}
                </p>

                <p className="mt-4 text-sm text-neutral-400 transition group-hover:text-white">
                  {method.value}
                </p>

                <div className="mt-6 flex items-center justify-between">
                  <div className="h-px w-6 bg-gradient-to-r from-white/20 to-transparent transition-all duration-500 group-hover:w-12" />
                  <span className="text-neutral-700 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white">
                    ↗
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-6 py-16">
          <div className="relative overflow-hidden rounded-[40px] border border-white/[0.07] bg-white/[0.02] px-8 py-16 text-center backdrop-blur-2xl sm:px-16">
            <div className="pointer-events-none absolute left-1/2 top-[-200px] h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-cyan-500/[0.07] blur-[140px]" />

            <div className="relative">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/60">
                Ready to build
              </p>

              <h2 className="mx-auto mt-5 max-w-2xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                Start with an idea.
                <span className="block text-neutral-500">
                  We&apos;ll handle the rest.
                </span>
              </h2>

              <p className="mx-auto mt-6 max-w-lg text-base leading-7 text-neutral-400">
                Use the project form to share what you want
                to build and Aila will help define the right
                direction, technology, and path forward.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/#start-project"
                  className="rounded-full bg-white px-8 py-4 text-sm font-semibold text-black transition hover:scale-105"
                >
                  Start a Project →
                </Link>

                <Link
                  href="/products/intelligence"
                  className="rounded-full border border-white/[0.1] bg-white/[0.04] px-8 py-4 text-sm text-neutral-300 transition hover:bg-white/[0.08]"
                >
                  Talk to Aila Intelligence
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}