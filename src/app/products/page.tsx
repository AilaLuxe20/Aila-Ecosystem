import Link from "next/link";
import {
  Brain,
  Scale,
  ShoppingBag,
  HeartPulse,
  Car,
  ShipWheel,
  Building2,
  ArrowRight,
} from "lucide-react";

const products = [
  {
    title: "Aila Intelligence",
    description: "Enterprise AI assistant for businesses.",
    icon: Brain,
    status: "Available",
  },
  {
    title: "AilaLegal",
    description: "AI legal workspace for professionals.",
    icon: Scale,
    status: "Available",
  },
  {
    title: "AilaCommerce",
    description: "AI-powered commerce platform.",
    icon: ShoppingBag,
    status: "Coming Soon",
  },
  {
    title: "AilaHealth",
    description: "Healthcare intelligence platform.",
    icon: HeartPulse,
    status: "Coming Soon",
  },
  {
    title: "AilaRide",
    description: "Ride-hailing powered by AI.",
    icon: Car,
    status: "In Development",
  },
  {
    title: "AilaShip",
    description: "Logistics and delivery ecosystem.",
    icon: ShipWheel,
    status: "In Development",
  },
  {
    title: "Aila Enterprise",
    description: "Digital transformation platform.",
    icon: Building2,
    status: "Available",
  },
];

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <section className="mx-auto max-w-7xl px-6 py-28">

        <div className="text-center">
          <p className="uppercase tracking-[0.45em] text-cyan-400">
            PRODUCTS
          </p>

          <h1 className="mt-5 text-7xl font-black">
            AI Products
            <br />
            Built For The Future
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-slate-300">
            Premium software engineered by Aila Ecosystem for startups,
            enterprises and governments.
          </p>
        </div>

        <div className="mt-24 grid gap-8 md:grid-cols-2 xl:grid-cols-3">

          {products.map((product) => {

            const Icon = product.icon;

            return (

              <div
                key={product.title}
                className="rounded-[30px] border border-white/10 bg-white/5 p-8 transition hover:-translate-y-3 hover:border-cyan-400"
              >

                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-cyan-500/10">
                  <Icon className="h-10 w-10 text-cyan-400" />
                </div>

                <h2 className="mt-8 text-3xl font-black">
                  {product.title}
                </h2>

                <p className="mt-5 leading-8 text-slate-400">
                  {product.description}
                </p>

                <span className="mt-6 inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
                  {product.status}
                </span>

                <Link
                  href="/contact"
                  className="mt-8 flex items-center font-semibold text-cyan-400"
                >
                  Request Demo

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