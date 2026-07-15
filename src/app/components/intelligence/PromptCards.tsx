const prompts = [
  "Build an AI SaaS Platform",
  "Create a Mobile App",
  "Generate Website",
  "Draft a Business Plan",
  "Analyze a Legal Contract",
  "Automate My Workflow",
];

export default function PromptCards() {
  return (
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

      {prompts.map((prompt) => (
        <button
          key={prompt}
          className="group rounded-2xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-400 hover:bg-cyan-500/10"
        >
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-cyan-400">
            Suggested
          </p>

          <h3 className="text-xl font-bold transition group-hover:text-cyan-300">
            {prompt}
          </h3>

          <p className="mt-3 text-sm text-slate-400">
            Click to instantly start this conversation with Aila Intelligence.
          </p>
        </button>
      ))}

    </section>
  );
}
