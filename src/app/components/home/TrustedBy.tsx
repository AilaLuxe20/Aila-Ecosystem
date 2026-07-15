"use client";

const companies = [
  "Artificial Intelligence",
  "Enterprise",
  "Legal",
  "Healthcare",
  "Finance",
  "Government",
  "Cloud",
  "Automation",
];

export default function TrustedBy() {
  return (
    <section className="py-16 border-y border-white/10 overflow-hidden">
      <div className="flex gap-6 whitespace-nowrap animate-[scroll_25s_linear_infinite]">
        {[...companies, ...companies].map((item) => (
          <div
            key={item}
            className="rounded-full border border-cyan-500/20 bg-white/5 px-8 py-3"
          >
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}