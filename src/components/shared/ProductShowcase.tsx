"use client";

type Feature = {
  title: string;
  description: string;
};

type ProductShowcaseProps = {
  title: string;
  subtitle: string;
  features: Feature[];
  accent: "emerald" | "amber" | "rose" | "teal" | "indigo" | "fuchsia";
  status?: string;
};

const accentStyles = {
  emerald: {
    dot: "bg-emerald-300 shadow-[0_0_14px_rgba(34,197,94,0.9)]",
    glow: "bg-emerald-500/[0.08]",
    border: "border-emerald-300/15",
    bg: "bg-emerald-300/[0.05]",
    blur: "bg-emerald-300/[0.12]",
  },
  amber: {
    dot: "bg-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.9)]",
    glow: "bg-amber-500/[0.08]",
    border: "border-amber-300/15",
    bg: "bg-amber-300/[0.05]",
    blur: "bg-amber-300/[0.12]",
  },
  rose: {
    dot: "bg-rose-300 shadow-[0_0_14px_rgba(244,63,94,0.9)]",
    glow: "bg-rose-500/[0.08]",
    border: "border-rose-300/15",
    bg: "bg-rose-300/[0.05]",
    blur: "bg-rose-300/[0.12]",
  },
  teal: {
    dot: "bg-teal-300 shadow-[0_0_14px_rgba(20,181,169,0.9)]",
    glow: "bg-teal-500/[0.08]",
    border: "border-teal-300/15",
    bg: "bg-teal-300/[0.05]",
    blur: "bg-teal-300/[0.12]",
  },
  indigo: {
    dot: "bg-indigo-300 shadow-[0_0_14px_rgba(129,140,249,0.9)]",
    glow: "bg-indigo-500/[0.08]",
    border: "border-indigo-300/15",
    bg: "bg-indigo-300/[0.05]",
    blur: "bg-indigo-300/[0.12]",
  },
  fuchsia: {
    dot: "bg-fuchsia-300 shadow-[0_0_14px_rgba(217,70,239,0.9)]",
    glow: "bg-fuchsia-500/[0.08]",
    border: "border-fuchsia-300/15",
    bg: "bg-fuchsia-300/[0.05]",
    blur: "bg-fuchsia-300/[0.12]",
  },
};

/**
 * Premium product showcase card.
 *
 * Reusable across all Aila platform product pages. Displays a
 * feature-rich card with accent-coloured styling that matches
 * the product's design language.
 */
export default function ProductShowcase({
  title,
  subtitle,
  features,
  accent,
  status = "Online",
}: ProductShowcaseProps) {
  const a = accentStyles[accent];

  return (
    <div className="relative">
      <div
        className={`pointer-events-none absolute inset-0 rounded-full ${a.glow} blur-[110px]`}
      />

      <div className="relative overflow-hidden rounded-[36px] border border-white/[0.09] bg-[#080808]/90 shadow-[0_40px_120px_rgba(0,0,0,0.65)] backdrop-blur-2xl h-[600px] flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-5">
          <div className="flex items-center gap-4">
            <div
              className={`relative flex h-12 w-12 items-center justify-center rounded-2xl border ${a.border} ${a.bg}`}
            >
              <div
                className={`absolute h-6 w-6 rounded-full ${a.blur} blur-lg`}
              />

              <div
                className={`relative h-2.5 w-2.5 rounded-full ${a.dot}`}
              />
            </div>

            <div>
              <h2 className="text-sm font-medium text-white">
                {title}
              </h2>

              <p className="mt-1 text-xs text-neutral-600">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-green-400/10 bg-green-400/[0.04] px-3 py-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />

              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-400" />
            </span>

            <span className="hidden text-[9px] uppercase tracking-[0.18em] text-green-300/60 sm:block">
              {status}
            </span>
          </div>
        </div>

        {/* FEATURES */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition duration-300 hover:border-white/[0.12] hover:bg-white/[0.04]"
            >
              <h3 className="text-lg font-medium text-white">
                {feature.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-neutral-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
