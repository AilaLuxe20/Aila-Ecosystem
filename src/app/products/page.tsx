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
    <main className="enterprise-page min-h-screen text-white">
      <section className="mx-auto max-w-7xl px-8 py-16 md:py-24">

        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--aila-gold)]">
            PRODUCTS
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] md:text-6xl">
            AI Products
            <br />
            Built for Enterprise Work
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-white/62 md:text-lg">
            Premium software engineered by Aila Ecosystem for startups,
            enterprises and governments.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {products.map((product) => {

            const Icon = product.icon;

            return (

              <div
                key={product.title}
                className="enterprise-card group rounded-[16px] p-6 transition duration-300 hover:-translate-y-1 hover:border-[var(--aila-gold)]/35"
              >

                <div className="flex h-14 w-14 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.05]">
                  <Icon className="h-7 w-7 text-[var(--aila-gold)]" />
                </div>

                <h2 className="mt-8 text-2xl font-semibold tracking-[-0.02em]">
                  {product.title}
                </h2>

                <p className="mt-4 min-h-[56px] leading-7 text-white/58">
                  {product.description}
                </p>

                <span className="mt-6 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/55">
                  {product.status}
                </span>

                <Link
                  href="/contact"
                  className="enterprise-focus mt-8 inline-flex items-center rounded-[10px] bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-[var(--aila-gold)]"
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
