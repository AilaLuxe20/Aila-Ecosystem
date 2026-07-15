export default function Sidebar() {
  return (
    <aside className="hidden w-72 border-r border-white/10 bg-black/40 backdrop-blur-xl lg:flex lg:flex-col">

      <div className="border-b border-white/10 p-8">

        <h2 className="text-3xl font-black text-cyan-400">
          AILA
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Intelligence
        </p>

      </div>

      <nav className="flex-1 space-y-2 p-6">

        {[
          "New Chat",
          "Conversations",
          "Voice",
          "Documents",
          "Images",
          "Automation",
          "Memory",
          "Settings",
        ].map((item) => (
          <button
            key={item}
            className="w-full rounded-xl px-4 py-3 text-left transition hover:bg-cyan-500/10 hover:text-cyan-400"
          >
            {item}
          </button>
        ))}

      </nav>

    </aside>
  );
}
