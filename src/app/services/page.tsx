import Link from "next/link";
import {
  Globe,
  BrainCircuit,
  Smartphone,
  MonitorSmartphone,
  Workflow,
  Bot,
  ArrowRight,
} from "lucide-react";

const services = [
  {
    title: "AI Solutions",
    description:
      "Custom AI assistants, chatbots and intelligent business systems.",
    icon: BrainCircuit,
  },
  {
    title: "Web Development",
    description:
      "Premium websites built with Next.js for startups and enterprises.",
    icon: Globe,
  },
  {
    title: "Mobile Apps",
    description:
      "Beautiful Android and iOS applications with world-class UX.",
    icon: Smartphone,
  },
  {
    title: "SaaS Platforms",
    description:
      "Complete cloud software engineered for growth.",
    icon: MonitorSmartphone,
  },
  {
    title: "Automation",
    description:
      "Automate operations and eliminate repetitive work.",
    icon: Workflow,
  },
  {
    title: "AI Agents",
    description:
      "Autonomous AI employees that work 24/7.",
    icon: Bot,
  },
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">

      <section className="mx-auto max-w-7xl px-6 py-28">

        <div className="text-center">

          <p className="uppercase tracking-[0.45em] text-cyan-400">
            SERVICES
          </p>

          <h1 className="mt-6 text-7xl font-black">
            We Build
            <br />
            Intelligent Businesses
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-slate-300">
            From AI software to enterprise systems, Aila delivers premium
            digital products designed to scale globally.
          </p>

        </div>

        <div className="mt-24 grid gap-8 md:grid-cols-2 xl:grid-cols-3">

          {services.map((service) => {

            const Icon = service.icon;

            return (

              <div
                key={service.title}
                className="rounded-[32px] border border-white/10 bg-white/5 p-8 transition duration-300 hover:-translate-y-3 hover:border-cyan-400"
              >

                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-cyan-500/10">
                  <Icon className="h-10 w-10 text-cyan-400" />
                </div>

                <h2 className="mt-8 text-3xl font-black">
                  {service.title}
                </h2>

                <p className="mt-5 leading-8 text-slate-400">
                  {service.description}
                </p>

                <Link
                  href="/contact"
                  className="mt-8 inline-flex items-center font-semibold text-cyan-400"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>

              </div>

            );

          })}

        </div>

      </section>

    </main>
  );
}