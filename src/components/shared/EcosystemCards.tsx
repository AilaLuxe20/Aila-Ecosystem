import Link from "next/link";

import { groupedCatalogProducts, type ProductKey } from "@/core/products/catalog";

const accentByProduct: Record<
  ProductKey,
  {
    glow: string;
    orb: string;
    dot: string;
    text: string;
    line: string;
  }
> = {
  intelligence: {
    glow: "group-hover:bg-cyan-400/10",
    orb: "from-cyan-300/30 to-cyan-500/5",
    dot: "bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.9)]",
    text: "group-hover:text-cyan-200",
    line: "from-cyan-300/70",
  },
  ailalegal: {
    glow: "group-hover:bg-blue-500/10",
    orb: "from-blue-300/30 to-blue-600/5",
    dot: "bg-blue-300 shadow-[0_0_16px_rgba(147,197,253,0.9)]",
    text: "group-hover:text-blue-200",
    line: "from-blue-300/70",
  },
  business: {
    glow: "group-hover:bg-purple-500/10",
    orb: "from-purple-300/30 to-purple-600/5",
    dot: "bg-purple-300 shadow-[0_0_16px_rgba(216,180,254,0.9)]",
    text: "group-hover:text-purple-200",
    line: "from-purple-300/70",
  },
  automation: {
    glow: "group-hover:bg-violet-500/10",
    orb: "from-violet-300/30 to-violet-600/5",
    dot: "bg-violet-300 shadow-[0_0_16px_rgba(196,181,253,0.9)]",
    text: "group-hover:text-violet-200",
    line: "from-violet-300/70",
  },
  commerce: {
    glow: "group-hover:bg-emerald-500/10",
    orb: "from-emerald-300/30 to-emerald-600/5",
    dot: "bg-emerald-300 shadow-[0_0_16px_rgba(52,211,153,0.9)]",
    text: "group-hover:text-emerald-200",
    line: "from-emerald-300/70",
  },
  ads: {
    glow: "group-hover:bg-amber-500/10",
    orb: "from-amber-300/30 to-amber-600/5",
    dot: "bg-amber-300 shadow-[0_0_16px_rgba(252,211,77,0.9)]",
    text: "group-hover:text-amber-200",
    line: "from-amber-300/70",
  },
  calendar: {
    glow: "group-hover:bg-rose-500/10",
    orb: "from-rose-300/30 to-rose-600/5",
    dot: "bg-rose-300 shadow-[0_0_16px_rgba(253,164,175,0.9)]",
    text: "group-hover:text-rose-200",
    line: "from-rose-300/70",
  },
  sites: {
    glow: "group-hover:bg-teal-500/10",
    orb: "from-teal-300/30 to-teal-600/5",
    dot: "bg-teal-300 shadow-[0_0_16px_rgba(94,234,212,0.9)]",
    text: "group-hover:text-teal-200",
    line: "from-teal-300/70",
  },
  apps: {
    glow: "group-hover:bg-indigo-500/10",
    orb: "from-indigo-300/30 to-indigo-600/5",
    dot: "bg-indigo-300 shadow-[0_0_16px_rgba(165,180,252,0.9)]",
    text: "group-hover:text-indigo-200",
    line: "from-indigo-300/70",
  },
  flow: {
    glow: "group-hover:bg-fuchsia-500/10",
    orb: "from-fuchsia-300/30 to-fuchsia-600/5",
    dot: "bg-fuchsia-300 shadow-[0_0_16px_rgba(240,171,252,0.9)]",
    text: "group-hover:text-fuchsia-200",
    line: "from-fuchsia-300/70",
  },
};

export default function EcosystemCards() {
  const groups = groupedCatalogProducts();

  return (
    <div className="w-full space-y-14">
      {groups.map((group) => (
        <section key={group.group}>
          <p className="mb-5 text-xs uppercase tracking-[0.25em] text-neutral-600">
            {group.label}
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            {group.products.map((product, index) => {
              const accent = accentByProduct[product.key];
              const shortName = product.title.replace("Aila ", "").slice(0, 2).toUpperCase();

              return (
                <Link
                  key={product.key}
                  href={product.href}
                  className="group relative block overflow-hidden rounded-[32px] border border-white/[0.08] bg-white/[0.025] transition duration-500 hover:-translate-y-1 hover:border-white/[0.16] hover:bg-white/[0.045]"
                >
                  <div
                    className={`pointer-events-none absolute right-[-80px] top-[-80px] h-72 w-72 rounded-full bg-transparent blur-[100px] transition duration-700 ${accent.glow}`}
                  />
                  <div
                    className={`absolute left-12 right-12 top-0 h-px bg-gradient-to-r ${accent.line} via-white/10 to-transparent opacity-0 transition duration-500 group-hover:opacity-100`}
                  />

                  <div className="relative flex min-h-[360px] flex-col p-7 sm:p-9">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div
                          className={`relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${accent.orb}`}
                        >
                          <div className="absolute inset-0 bg-black/20" />
                          <span className="relative text-sm font-semibold tracking-[-0.02em] text-white">
                            {shortName}
                          </span>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-600">
                            {group.label} · {String(index + 1).padStart(2, "0")}
                          </p>
                          <p className="mt-1 text-xs text-neutral-400">
                            {product.paid ? "Pro" : "Included"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/20 px-3 py-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
                        <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                          Online
                        </span>
                      </div>
                    </div>

                    <div className="mt-10">
                      <h3 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                        {product.title}
                      </h3>
                      <p className="mt-5 max-w-xl text-base leading-7 text-neutral-400">
                        {product.description}
                      </p>
                    </div>

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
        </section>
      ))}
    </div>
  );
}
