import Link from "next/link";
import { ArrowRight, BrainCircuit, Globe2, Rocket } from "lucide-react";

const values = [
  {
    title: "Innovation",
    description:
      "We build intelligent software that solves real business problems.",
    icon: BrainCircuit,
  },
  {
    title: "Global Vision",
    description:
      "Designed to empower startups, enterprises and governments worldwide.",
    icon: Globe2,
  },
  {
    title: "Execution",
    description:
      "Fast delivery, premium quality and scalable engineering.",
    icon: Rocket,
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">

      <section className="mx-auto max-w-7xl px-6 py-28">

        <div className="text-center">

          <p className="uppercase tracking-[0.45em] text-cyan-400">
            ABOUT AILA
          </p>

          <h1 className="mt-6 text-7xl font-black">
            Building The Future
            <br />
            With Artificial Intelligence
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-slate-300">
            Aila Ecosystem is an AI software company focused on building
            intelligent products, enterprise platforms and automation
            solutions that transform how businesses operate.
          </p>

        </div>

        <div className="mt-24 grid gap-8 md:grid-cols-3">

          {values.map((value) => {

            const Icon = value.icon;

            return (

              <div
                key={value.title}
                className="rounded-[32px] border border-white/10 bg-white/5 p-8 transition hover:-translate-y-3 hover:border-cyan-400"
              >

                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-cyan-500/10">
                  <Icon className="h-10 w-10 text-cyan-400" />
                </div>

                <h2 className="mt-8 text-3xl font-black">
                  {value.title}
                </h2>

                <p className="mt-5 leading-8 text-slate-400">
                  {value.description}
                </p>

              </div>

            );

          })}

        </div>

        <div className="mt-24 rounded-[36px] border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 p-12 text-center">

          <h2 className="text-5xl font-black">
            Ready To Build Something Amazing?
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Partner with Aila Ecosystem to create world-class AI software,
            SaaS platforms and enterprise applications.
          </p>

          <Link
            href="/contact"
            className="mt-10 inline-flex items-center rounded-2xl bg-cyan-500 px-8 py-4 font-semibold text-white transition hover:bg-cyan-400"
          >
            Start Your Project
            <ArrowRight className="ml-3 h-5 w-5" />
          </Link>

        </div>

      </section>

    </main>
  );
}