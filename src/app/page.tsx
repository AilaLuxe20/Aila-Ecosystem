import Link from "next/link";
import AilaAssistant from "./components/AilaAssistant";
import EcosystemCards from "./components/EcosystemCards";
import AnimatedSection from "./components/AnimatedSection";
import ProjectInquiry from "./components/ProjectInquiry";

// Define Interfaces
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

// Define Data Arrays
const services: Service[] = [
  { title: "AI Integration", desc: "Seamlessly embed intelligence into your existing stack." },
  { title: "Automation", desc: "Streamline operations with custom-built agents." },
  { title: "Legal Tech", desc: "Document analysis and compliance, automated." },
  { title: "Web Strategy", desc: "Modern, high-performance digital experiences." },
];

const platforms: Platform[] = [
  { type: "SaaS", title: "Aila Legal", description: "Automated legal document analysis.", href: "/products/ailalegal" },
  { type: "Intelligence", title: "Aila AI", description: "Your central intelligence command.", href: "/products/intelligence" },
  { type: "In-Progress", title: "Nexus", description: "Global infrastructure coordination.", status: "Coming Q4" },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030303] text-white">
      {/* HERO SECTION */}
      <section className="mx-auto flex min-h-screen max-w-7xl items-center px-6 pb-20 pt-32">
        {/* Hero content placeholder */}
        <h1 className="text-6xl font-bold">Welcome to Aila</h1>
      </section>

      {/* SERVICES SECTION */}
      <section id="services" className="mx-auto max-w-7xl px-6 py-24">
        <AnimatedSection>
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/70">What We Build</p>
            <h2 className="mt-5 text-5xl font-bold">Services</h2>
          </div>
        </AnimatedSection>
        <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service) => (
            <div key={service.title} className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition hover:-translate-y-2 hover:border-cyan-400/40">
              <h3 className="text-2xl font-semibold">{service.title}</h3>
              <p className="mt-4 leading-7 text-neutral-400">{service.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCTS SECTION */}
      <section id="products" className="mx-auto max-w-7xl px-6 py-24">
        <AnimatedSection>
          <div className="mb-16 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/70">Intelligent Products</p>
            <h2 className="mt-5 text-5xl font-bold">Aila Products</h2>
          </div>
          <EcosystemCards />
        </AnimatedSection>
      </section>

      {/* WORK & PLATFORMS SECTION */}
      <section id="work" className="relative mx-auto max-w-7xl px-6 py-28">
        <AnimatedSection>
          <h2 className="text-5xl font-bold">Selected Work</h2>
        </AnimatedSection>
        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {platforms.map((p) => (
            <div key={p.title} className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-7">
              <span className="text-xs text-neutral-500 uppercase">{p.type}</span>
              <h3 className="mt-4 text-2xl font-semibold">{p.title}</h3>
              <p className="mt-4 text-neutral-400 text-sm leading-relaxed">{p.description}</p>
              {p.href ? (
                <Link href={p.href} target="_blank" className="mt-6 block text-cyan-300">Visit Platform &rarr;</Link>
              ) : (
                <p className="mt-6 text-neutral-600 italic">{p.status}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* PROJECT INQUIRY */}
      <section id="start-project">
        <AnimatedSection>
          <ProjectInquiry />
        </AnimatedSection>
      </section>
    </main>
  );
}