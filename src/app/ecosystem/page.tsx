import Link from "next/link";
import {
  BrainCircuit,
  Scale,
  ShoppingBag,
  HeartPulse,
  Building2,
  Bot,
  ArrowRight,
} from "lucide-react";

const apps = [
  {
    title: "Aila Intelligence",
    description:
      "Advanced AI assistant capable of reasoning, automation and enterprise workflows.",
    icon: BrainCircuit,
  },
  {
    title: "AilaLegal",
    description:
      "Legal AI for contracts, compliance, document intelligence and legal research.",
    icon: Scale,
  },
  {
    title: "AilaCommerce",
    description:
      "Modern AI powered commerce platform for businesses of every size.",
    icon: ShoppingBag,
  },
  {
    title: "AilaHealth",
    description:
      "Healthcare intelligence with automation and patient management.",
    icon: HeartPulse,
  },
  {
    title: "Aila Enterprise",
    description:
      "Complete digital transformation suite for organizations.",
    icon: Building2,
  },
  {
    title: "Aila Studio",
    description:
      "Build AI products, SaaS platforms and intelligent applications faster.",
    icon: Bot,
  },
];

export default function EcosystemPage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">

      <section className="mx-auto max-w-7xl px-6 py-32">

        <div className="text-center">

          <p className="uppercase tracking-[0.45em] text-cyan-400">
            AILA ECOSYSTEM
          </p>

          <h1 className="mt-6 text-7xl font-black">
            The Future
            <br />
            of Intelligent Software
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-slate-300">
            Every Aila product is connected through one ecosystem powered by
            artificial intelligence, automation and premium engineering.
          </p>

        </div>

        <div className="mt-24 grid gap-8 md:grid-cols-2 xl:grid-cols-3">

          {apps.map((app) => {

            const Icon = app.icon;

            return (

              <div
                key={app.title}
                className="rounded-[32px] border border-white/10 bg-white/5 p-8 transition duration-300 hover:-translate-y-3 hover:border-cyan-400"
              >

                <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-cyan-500/10">

                  <Icon className="h-10 w-10 text-cyan-400" />

                </div>

                <h2 className="text-3xl font-black">

                  {app.title}

                </h2>

                <p className="mt-5 leading-8 text-slate-400">

                  {app.description}

                </p>

                <Link
                  href="/contact"
                  className="mt-8 inline-flex items-center font-semibold text-cyan-400"
                >
                  Learn More

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