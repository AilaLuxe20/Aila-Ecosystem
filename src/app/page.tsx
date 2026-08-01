import Link from "next/link";
import ChatInterface from "@/components/ai/ChatInterface";
import EcosystemCards from "@/components/shared/EcosystemCards";
import AnimatedSection from "@/components/ui/AnimatedSection";
import ProjectInquiry from "@/components/forms/ProjectInquiry";

const services = [
  {
    title: "Web Development",
    desc: "Business websites, dashboards, eCommerce and SaaS platforms.",
  },
  {
    title: "App Development",
    desc: "Android, iPhone and Progressive Web Apps.",
  },
  {
    title: "AI Solutions",
    desc: "Chatbots, AI agents, automation and intelligent workflows.",
  },
  {
    title: "UI / UX Design",
    desc: "Modern premium interfaces focused on user experience.",
  },
];

const platforms = [
  {
    title: "TLUXE Hairs",
    description:
      "A luxury hair shopping platform and real client commerce experience.",
    status: "Live Platform",
    type: "Commerce",
    href: "https://tluxehairs.shop",
    external: true,
    accent: "from-amber-300/20 via-yellow-500/5 to-transparent",
  },
  {
    title: "Shopping Web App",
    description:
      "A modern intelligent shopping experience built for the next generation of digital commerce.",
    status: "Coming Soon",
    type: "Web App",
    href: "",
    external: false,
    accent: "from-purple-400/20 via-fuchsia-500/5 to-transparent",
  },
  {
    title: "Hotel Booking",
    description:
      "A premium hotel discovery and reservation experience built as an interactive product demo.",
    status: "Demo",
    type: "Booking Platform",
    href: "",
    external: false,
    accent: "from-blue-400/20 via-cyan-500/5 to-transparent",
  },
  {
    title: "Cleaning Booking",
    description:
      "A service booking experience designed for cleaning businesses and modern service operations.",
    status: "Demo",
    type: "Service Platform",
    href: "",
    external: false,
    accent: "from-cyan-300/20 via-teal-500/5 to-transparent",
  },
  {
    title: "Restaurant",
    description:
      "A modern restaurant experience for menus, reservations, discovery and digital ordering.",
    status: "Demo",
    type: "Hospitality",
    href: "",
    external: false,
    accent: "from-orange-400/20 via-red-500/5 to-transparent",
  },
  {
    title: "Barber",
    description:
      "A premium barber booking experience for appointments, services and customer management.",
    status: "Demo",
    type: "Booking Platform",
    href: "",
    external: false,
    accent: "from-neutral-300/20 via-neutral-500/5 to-transparent",
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030303] text-white">
      {/* BACKGROUND */}
      <div className="absolute inset-0 -z-30 bg-[#030303]" />

      <div className="absolute inset-0 -z-20 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px]" />

      <div className="absolute left-1/2 top-20 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-500/20 blur-[160px]" />

      <div className="absolute right-0 top-96 -z-10 h-[350px] w-[350px] rounded-full bg-purple-600/20 blur-[150px]" />

      <div className="absolute bottom-0 left-0 -z-10 h-[350px] w-[350px] rounded-full bg-cyan-500/20 blur-[150px]" />

      {/* HERO */}
      <section className="mx-auto flex min-h-screen max-w-7xl items-center px-6 pb-20 pt-32">
        <div className="grid w-full gap-20 lg:grid-cols-2 lg:items-center">
          <AnimatedSection>
            <div>
              <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2 backdrop-blur-xl">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />

                <span className="text-sm text-neutral-300">
                  Aila Intelligence Online
                </span>
              </div>

              <h1 className="text-5xl font-bold leading-tight md:text-7xl">
                Build the Future

                <span className="mt-2 block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
                  with AI.
                </span>
              </h1>

              <p className="mt-8 max-w-xl text-lg leading-8 text-neutral-400">
                Aila Ecosystem is an intelligent software company building
                AI-powered websites, applications, automation systems and
                digital experiences for modern businesses.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/#start-project"
                  className="rounded-full bg-white px-8 py-4 font-semibold text-black transition hover:scale-105"
                >
                  Start a Project
                </Link>

                <Link
                  href="/#work"
                  className="rounded-full border border-white/10 bg-white/5 px-8 py-4 backdrop-blur-xl transition hover:bg-white/10"
                >
                  Explore Our Work
                </Link>
              </div>

              <div className="mt-16 grid grid-cols-3 gap-8">
                <div>
                  <h2 className="text-4xl font-bold">
                    AI
                  </h2>

                  <p className="mt-2 text-neutral-400">
                    Powered
                  </p>
                </div>

                <div>
                  <h2 className="text-4xl font-bold">
                    Web
                  </h2>

                  <p className="mt-2 text-neutral-400">
                    Development
                  </p>
                </div>

                <div>
                  <h2 className="text-4xl font-bold">
                    Apps
                  </h2>

                  <p className="mt-2 text-neutral-400">
                    iOS • Android
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <ChatInterface mode="intelligence" />
          </AnimatedSection>
        </div>
      </section>

      {/* SERVICES */}
      <section
        id="services"
        className="mx-auto max-w-7xl px-6 py-24"
      >
        <AnimatedSection>
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/70">
              What We Build
            </p>

            <h2 className="mt-5 text-5xl font-bold">
              Services
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-neutral-400">
              Premium software development powered by Aila Intelligence.
            </p>
          </div>
        </AnimatedSection>

        <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service) => (
            <div
              key={service.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-cyan-400/40"
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
      <section
        id="products"
        className="mx-auto max-w-7xl px-6 py-24"
      >
        <AnimatedSection>
          <div className="mb-16 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/70">
              Intelligent Products
            </p>

            <h2 className="mt-5 text-5xl font-bold">
              Aila Products
            </h2>
          </div>
        </AnimatedSection>

        <AnimatedSection>
          <EcosystemCards />
        </AnimatedSection>
      </section>

      {/* WORK & PLATFORMS */}
      <section
        id="work"
        className="relative mx-auto max-w-7xl px-6 py-28"
      >
        <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/[0.07] blur-[180px]" />

        <AnimatedSection>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/70">
                Selected Work
              </p>

              <h2 className="mt-5 max-w-3xl text-5xl font-bold tracking-[-0.04em] sm:text-6xl">
                Platforms built to

                <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-500 bg-clip-text text-transparent">
                  work in the real world.
                </span>
              </h2>
            </div>

            <p className="max-w-md leading-8 text-neutral-400">
              Explore live platforms, products in development and interactive
              demonstrations across commerce, hospitality and service
              industries.
            </p>
          </div>
        </AnimatedSection>

        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {platforms.map((platform, index) => {
            const cardContent = (
              <>
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${platform.accent} opacity-60 transition duration-500 group-hover:opacity-100`}
                />

                <div className="relative flex min-h-[340px] flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className={`rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] ${
                        platform.status === "Live Platform"
                          ? "border-green-400/20 bg-green-400/[0.07] text-green-300"
                          : platform.status === "Coming Soon"
                            ? "border-purple-400/20 bg-purple-400/[0.07] text-purple-300"
                            : "border-white/10 bg-white/5 text-neutral-400"
                      }`}
                    >
                      {platform.status}
                    </span>

                    <span className="text-xs text-neutral-700">
                      0{index + 1}
                    </span>
                  </div>

                  <div className="mt-auto">
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-600">
                      {platform.type}
                    </p>

                    <h3 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">
                      {platform.title}
                    </h3>

                    <p className="mt-4 leading-7 text-neutral-500">
                      {platform.description}
                    </p>

                    <div className="mt-8 flex items-center justify-between border-t border-white/[0.07] pt-5">
                      <span className="text-sm text-neutral-400 transition group-hover:text-white">
                        {platform.status === "Live Platform"
                          ? "Visit Platform"
                          : platform.status === "Coming Soon"
                            ? "In Development"
                            : "Explore Demo"}
                      </span>

                      <span className="text-xl text-neutral-600 transition duration-300 group-hover:translate-x-1 group-hover:text-cyan-300">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </>
            );

            if (platform.href) {
              return (
                <a
                  key={platform.title}
                  href={platform.href}
                  target={platform.external ? "_blank" : undefined}
                  rel={platform.external ? "noopener noreferrer" : undefined}
                  className="group relative overflow-hidden rounded-[32px] border border-white/[0.08] bg-white/[0.025] p-7 transition duration-500 hover:-translate-y-2 hover:border-white/[0.16]"
                >
                  {cardContent}
                </a>
              );
            }

            return (
              <div
                key={platform.title}
                className="group relative overflow-hidden rounded-[32px] border border-white/[0.08] bg-white/[0.025] p-7 transition duration-500 hover:-translate-y-2 hover:border-white/[0.16]"
              >
                {cardContent}
              </div>
            );
          })}
        </div>

        <AnimatedSection>
          <div className="mt-12 flex flex-col gap-5 rounded-[32px] border border-white/[0.08] bg-white/[0.025] p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-medium">
                Have an idea for a platform?
              </p>

              <p className="mt-2 text-neutral-500">
                Aila can turn your concept into a real digital product.
              </p>
            </div>

            <Link
              href="/#start-project"
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-white px-7 py-3.5 font-semibold text-black transition hover:scale-105"
            >
              Build With Aila
            </Link>
          </div>
        </AnimatedSection>
      </section>

      {/* PROJECT INQUIRY */}
      <AnimatedSection>
        <ProjectInquiry />
      </AnimatedSection>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-40 pt-20">
        <div className="rounded-[40px] border border-white/10 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 p-10 text-center backdrop-blur-2xl sm:p-16">
          <h2 className="text-4xl font-bold sm:text-5xl">
            Intelligence for what comes next.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-300">
            Explore the Aila Ecosystem, talk with intelligent products and turn
            your next idea into a real digital experience.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/#start-project"
              className="inline-flex rounded-full bg-white px-10 py-4 font-semibold text-black transition hover:scale-105"
            >
              Start Your Project
            </Link>

            <Link
              href="/products/intelligence"
              className="inline-flex rounded-full border border-white/10 bg-white/5 px-10 py-4 font-semibold text-white transition hover:bg-white/10"
            >
              Explore Aila Intelligence
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}



<<<<<<< HEAD

=======
>>>>>>> 6d08bcd (Apply Cline and agent changes to main worktree)
