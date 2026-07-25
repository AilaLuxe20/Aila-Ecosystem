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
  },
];

export default function FeaturePanel() {
  return (
    <section className="w-full max-w-5xl mx-auto mt-12">
      <div className="grid md:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
            className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-xl"
          >
            <h3 className="text-xl font-semibold text-white">
              {feature.title}
            </h3>

            <p className="text-gray-400 mt-3 text-sm">
              {feature.description}
            </p>

            <ul className="mt-5 space-y-2">
              {feature.items.map((item) => (
                <li
                  key={item}
                  className="text-gray-300 text-sm flex items-center gap-2"
                >
                  <span className="text-purple-400">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
