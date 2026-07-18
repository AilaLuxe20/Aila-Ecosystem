"use client";

import { motion } from "framer-motion";

const features = [
  {
    title: "Contract Risk Detection",
    description:
      "Identify unusual clauses, obligations, and potential risks inside legal agreements.",
    items: [
      "Risk clause highlighting",
      "Obligation tracking",
      "Legal issue detection",
    ],
    accent: {
      dot: "bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.8)]",
      check: "text-violet-400",
      border: "hover:border-violet-400/20",
      glow: "hover:bg-violet-400/[0.03]",
    },
  },
  {
    title: "Document Summary",
    description:
      "Generate clear summaries from complex legal documents in seconds.",
    items: [
      "Key points extraction",
      "Important dates",
      "Party identification",
    ],
    accent: {
      dot: "bg-blue-400 shadow-[0_0_12px_rgba(147,197,253,0.8)]",
      check: "text-blue-400",
      border: "hover:border-blue-400/20",
      glow: "hover:bg-blue-400/[0.03]",
    },
  },
  {
    title: "Clause Intelligence",
    description:
      "Understand important clauses and receive AI-powered explanations.",
    items: [
      "Clause breakdown",
      "Plain language explanations",
      "Context analysis",
    ],
    accent: {
      dot: "bg-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.8)]",
      check: "text-purple-400",
      border: "hover:border-purple-400/20",
      glow: "hover:bg-purple-400/[0.03]",
    },
  },
];

export default function FeaturePanel() {
  return (
    <section className="mx-auto w-full max-w-5xl">
      <div className="grid gap-4 md:grid-cols-3">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.7,
              delay: index * 0.12,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={`group relative overflow-hidden rounded-3xl border border-white/[0.07] bg-[#080808]/60 p-7 backdrop-blur-xl transition duration-500 ${feature.accent.border} ${feature.accent.glow}`}
          >
            {/* Top accent line */}
            <div className="absolute left-8 right-8 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Dot indicator */}
            <div className="mb-6 flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${feature.accent.dot}`} />
              <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-700">
                AilaLegal
              </span>
            </div>

            <h3 className="text-base font-semibold text-white">
              {feature.title}
            </h3>

            <p className="mt-3 text-sm leading-6 text-neutral-500">
              {feature.description}
            </p>

            <ul className="mt-6 space-y-3">
              {feature.items.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-sm text-neutral-400"
                >
                  <span className={`shrink-0 text-xs ${feature.accent.check}`}>
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            {/* Bottom line expands on hover */}
            <div className="mt-8 h-px w-8 bg-gradient-to-r from-white/20 to-transparent transition-all duration-500 group-hover:w-16" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}