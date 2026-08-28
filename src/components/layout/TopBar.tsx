export default function TopBar() {
  return (
    <header className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-white">
          AilaLegal AI
        </h1>

        <p className="text-sm text-gray-400">
          AI Legal Intelligence Workspace
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600" />

        <div>
          <p className="font-medium">Aila</p>
          <p className="text-xs text-gray-400">
            Workspace
          </p>
        </div>
      </div>
    </header>
  );
}
