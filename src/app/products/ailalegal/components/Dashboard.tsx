import DocumentAnalyzer from "./DocumentAnalyzer";

export default function Dashboard() {
  return (
    <div className="space-y-8">

      {/* Top Row */}
      <section className="grid gap-6 xl:grid-cols-3">

        <DocumentAnalyzer />

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Risk Analysis
            </h2>

            <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-semibold text-yellow-400">
              Medium Risk
            </span>
          </div>

          <div className="mt-6 space-y-4">

            <div className="rounded-xl bg-white/5 p-4">
              <h3 className="font-medium">Liability Clause</h3>
              <p className="mt-2 text-sm text-gray-400">
                Liability terms appear broad and may expose one party to
                significant financial responsibility.
              </p>
            </div>

            <div className="rounded-xl bg-white/5 p-4">
              <h3 className="font-medium">Termination</h3>
              <p className="mt-2 text-sm text-gray-400">
                Review termination conditions before signing.
              </p>
            </div>

          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h2 className="text-xl font-semibold">
            AI Assistant
          </h2>

          <div className="mt-6 rounded-2xl bg-black/30 p-4">
            <p className="text-gray-400">
              Hello 👋 I&apos;m Aila Intelligence.
            </p>

            <div className="mt-4 rounded-xl bg-cyan-500/10 p-3 text-cyan-300">
              Upload a legal document to begin analysis.
            </div>
          </div>

          <button className="mt-6 w-full rounded-xl bg-white py-3 font-semibold text-black transition hover:opacity-90">
            Open AI Assistant
          </button>
        </div>

      </section>

      {/* Workspace */}

      <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

        <h2 className="text-2xl font-bold">
          Legal Intelligence Workspace
        </h2>

        <p className="mt-4 max-w-3xl text-gray-400">
          After document analysis, extracted clauses, summaries, legal risks,
          obligations, recommendations and AI conversations will appear here.
        </p>

      </section>

    </div>
  );
}