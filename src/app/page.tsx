import Link from "next/link";
import AnimatedSection from "./components/AnimatedSection";
import EcosystemCards from "./components/EcosystemCards";
import ProjectInquiry from "./components/ProjectInquiry";

interface Service {
  title: string;
  desc: string;
}

interface Platform {
  type: string;
  title: string;
  description: string;
  href?: string;
  status?: string;
}

const services: Service[] = [
  {
    title: "AI Integration",
    desc: "Connect intelligent assistants, automation, and enterprise AI into your business.",
  },
  {
    title: "Enterprise Software",
    desc: "Premium web applications, SaaS platforms, and internal business systems.",
  },
  {
    title: "Legal Intelligence",
    desc: "AI-powered document analysis, compliance, and legal workflows.",
  },
  {
    title: "Business Automation",
    desc: "Automate repetitive operations with intelligent AI workflows.",
  },
];

const platforms: Platform[] = [
  {
    type: "Enterprise AI",
    title: "Aila Intelligence",
    description: "Your centralized AI command center.",
    href: "/products/intelligence",
  },
  {
    type: "Legal",
    title: "Aila Legal",
    description: "Enterprise legal document intelligence.",
    href: "/products/ailalegal",
  },
  {
    type: "Healthcare",
    title: "Aila Health",
    description: "Healthcare intelligence platform.",
    href: "/products/health",
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] text-white">
      {/* HERO */}
      <section className="mx-auto flex min-h-screen max-w-7xl items-center px-6">

        <div className="max-w-4xl">

          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
            Enterprise AI Ecosystem
          </span>

          <h1 className="mt-8 text-6xl font-extrabold leading-tight md:text-7xl">
            Build.
            <br />
            Automate.
            <br />
            Scale with AI.
          </h1>

          <p className="mt-8 max-w-2xl text-xl leading-9 text-neutral-400">
            Aila Ecosystem is an enterprise AI platform that unifies
            legal, healthcare, business, automation, intelligent
            applications, and enterprise workflows into one premium
            operating system.
          </p>

          <div className="mt-12 flex flex-wrap gap-4">

            <Link
              href="/register"
              className="rounded-2xl bg-cyan-500 px-8 py-4 font-semibold text-black transition hover:opacity-90"
            >
              Get Started
            </Link>

            <Link
              href="/login"
              className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 font-semibold transition hover:bg-white/10"
            >
              Sign In
            </Link>

            <Link
              href="/dashboard"
              className="rounded-2xl border border-white/10 px-8 py-4 font-semibold transition hover:bg-white/10"
            >
              Explore Ecosystem
            </Link>

          </div>

        </div>

      </section>

      {/* SERVICES */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <AnimatedSection>

          <div className="text-center">

            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/70">
              Enterprise Solutions
            </p>

            <h2 className="mt-5 text-5xl font-bold">
              What Aila Builds
            </h2>

          </div>

        </AnimatedSection>

        <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-4">

          {services.map((service) => (
            <div
              key={service.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition hover:-translate-y-2 hover:border-cyan-400/40"
            >
              <h3 className="text-2xl font-semibold">
                {service.title}
              </h3>

              <p className="mt-4 leading-7 text-neutral-400">
                {service.desc}
              </p>

            </div>
          ))}

        </div>
      </section>

      {/* PRODUCTS */}
      <section className="mx-auto max-w-7xl px-6 py-24">

        <AnimatedSection>

          <div className="mb-16 text-center">

            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/70">
              Products
            </p>

            <h2 className="mt-5 text-5xl font-bold">
              Aila Ecosystem
            </h2>

          </div>

          <EcosystemCards />

        </AnimatedSection>

      </section>

      {/* PLATFORM */}
      <section className="mx-auto max-w-7xl px-6 py-24">

        <AnimatedSection>

          <div className="mb-16">

            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/70">
              Platform
            </p>

            <h2 className="mt-5 text-5xl font-bold">
              Enterprise Applications
            </h2>

          </div>

        </AnimatedSection>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {platforms.map((platform) => (
            <div
              key={platform.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
            >
              <span className="text-xs uppercase tracking-widest text-cyan-300">
                {platform.type}
              </span>

              <h3 className="mt-4 text-2xl font-bold">
                {platform.title}
              </h3>

              <p className="mt-4 text-neutral-400">
                {platform.description}
              </p>

              {platform.href && (
                <Link
                  href={platform.href}
                  className="mt-8 inline-block text-cyan-300 transition hover:text-cyan-200"
                >
                  Open Platform →
                </Link>
              )}
            </div>
          ))}

        </div>

      </section>

      {/* CONTACT */}
      <AnimatedSection>
        <ProjectInquiry />
      </AnimatedSection>

    </main>
  );
}