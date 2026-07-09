import Link from "next/link";
import AilaAssistant from "./components/AilaAssistant";
import EcosystemCards from "./components/EcosystemCards";
import AnimatedSection from "./components/AnimatedSection";
import ProjectInquiry from "./components/ProjectInquiry";

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
                  href="/#services"
                  className="rounded-full border border-white/10 bg-white/5 px-8 py-4 backdrop-blur-xl transition hover:bg-white/10"
                >
                  Explore Services
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
            <AilaAssistant />
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
          {[
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
          ].map((service) => (
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