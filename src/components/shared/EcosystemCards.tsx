import Link from "next/link";

const products = [
  {
    number: "01",
    title: "Aila Intelligence",
    shortName: "AI",
    tag: "Intelligence Core",
    status: "Online",
    description:
      "The intelligence layer powering the Aila Ecosystem. Explore ideas, discover solutions and find the right path from possibility to working technology.",
    link: "/products/intelligence",
    accent: "cyan",
    capabilities: ["AI Guidance", "Discovery", "Product Intelligence"],
  },
  {
    number: "02",
    title: "AilaLegal AI",
    shortName: "AL",
    tag: "Legal Technology",
    status: "Active",
    description:
      "An intelligent legal technology experience designed to improve research, document understanding, organization and modern legal workflows.",
    link: "/products/ailalegal",
    accent: "blue",
    capabilities: ["Research", "Documents", "Legal Workflows"],
  },
  {
    number: "03",
    title: "Aila Business AI",
    shortName: "AB",
    tag: "Business Intelligence",
    status: "Building",
    description:
      "AI-powered business intelligence designed to uncover opportunities, improve operations and transform complex processes into smarter systems.",
    link: "/products/business",
    accent: "purple",
    capabilities: ["Insights", "Operations", "AI Strategy"],
  },
  {
    number: "04",
    title: "Aila Automation",
    shortName: "AA",
    tag: "Intelligent Systems",
    status: "Building",
    description:
      "Connected automation systems that reduce repetitive work, improve efficiency and help businesses operate with greater intelligence.",
    link: "/products/automation",
    accent: "violet",
    capabilities: ["Workflows", "Connections", "Automation"],
  },
];

const accentStyles = {
  cyan: {
    glow: "group-hover:bg-cyan-400/10",
    orb: "from-cyan-300/30 to-cyan-500/5",
    dot: "bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.9)]",
    text: "group-hover:text-cyan-200",
    line: "from-cyan-300/70",
  },
  blue: {
    glow: "group-hover:bg-blue-500/10",
    orb: "from-blue-300/30 to-blue-600/5",
    dot: "bg-blue-300 shadow-[0_0_16px_rgba(147,197,253,0.9)]",
    text: "group-hover:text-blue-200",
    line: "from-blue-300/70",
  },
  purple: {
    glow: "group-hover:bg-purple-500/10",
    orb: "from-purple-300/30 to-purple-600/5",
    dot: "bg-purple-300 shadow-[0_0_16px_rgba(216,180,254,0.9)]",
    text: "group-hover:text-purple-200",
    line: "from-purple-300/70",
  },
  violet: {
    glow: "group-hover:bg-violet-500/10",
    orb: "from-violet-300/30 to-violet-600/5",
    dot: "bg-violet-300 shadow-[0_0_16px_rgba(196,181,253,0.9)]",
    text: "group-hover:text-violet-200",
    line: "from-violet-300/70",
  },
};

export default function EcosystemCards() {
  return (
    <div className="w-full">
      <div className="grid gap-4 lg:grid-cols-2">
        {products.map((product) => {
          const accent =
            accentStyles[product.accent as keyof typeof accentStyles];

          return (
            <Link
              key={product.title}
              href={product.link}
              className="group relative block overflow-hidden rounded-[32px] border border-white/[0.08] bg-white/[0.025] transition duration-500 hover:-translate-y-1 hover:border-white/[0.16] hover:bg-white/[0.045]"
            >
              {/* HOVER GLOW */}
              <div
                className={`pointer-events-none absolute right-[-80px] top-[-80px] h-72 w-72 rounded-full bg-transparent blur-[100px] transition duration-700 ${accent.glow}`}
              />

              {/* TOP LIGHT */}
              <div
                className={`absolute left-12 right-12 top-0 h-px bg-gradient-to-r ${accent.line} via-white/10 to-transparent opacity-0 transition duration-500 group-hover:opacity-100`}
              />

              <div className="relative flex min-h-[430px] flex-col p-7 sm:p-9">
                {/* TOP ROW */}
                <div className="flex items-start justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={`relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${accent.orb}`}
                    >
                      <div className="absolute inset-0 bg-black/20" />

                      <span className="relative text-sm font-semibold tracking-[-0.02em] text-white">
                        {product.shortName}
                      </span>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-600">
                        Product {product.number}
                      </p>

                      <p className="mt-1 text-xs text-neutral-400">
                        {product.tag}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/20 px-3 py-1.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${accent.dot}`}
                    />

                    <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                      {product.status}
                    </span>
                  </div>
                </div>

                {/* PRODUCT CONTENT */}
                <div className="mt-14">
                  <h3 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                    {product.title}
                  </h3>

                  <p className="mt-5 max-w-xl text-base leading-7 text-neutral-400">
                    {product.description}
                  </p>
                </div>

                {/* CAPABILITIES */}
                <div className="mt-8 flex flex-wrap gap-2">
                  {product.capabilities.map((capability) => (
                    <span
                      key={capability}
                      className="rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-[11px] text-neutral-500 transition duration-300 group-hover:border-white/[0.12] group-hover:text-neutral-400"
                    >
                      {capability}
                    </span>
                  ))}
                </div>

                {/* BOTTOM */}
                <div className="mt-auto flex items-end justify-between pt-12">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-600">
                      Aila Ecosystem
                    </p>

                    <div className="mt-3 h-px w-16 bg-gradient-to-r from-white/30 to-transparent transition-all duration-500 group-hover:w-28" />
                  </div>

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-lg text-neutral-400 transition duration-500 group-hover:rotate-[-45deg] group-hover:border-white/20 group-hover:bg-white group-hover:text-black ${accent.text}`}
                  >
                    ↗
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
