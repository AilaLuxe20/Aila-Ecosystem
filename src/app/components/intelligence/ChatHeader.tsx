"use client";

export default function ChatHeader() {
  return (
    <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-6">

      <div>

        <h2 className="text-3xl font-black">
          Aila Intelligence
        </h2>

        <p className="mt-2 text-slate-400">
          Enterprise AI Assistant
        </p>

      </div>

      <div className="rounded-full bg-emerald-500/10 px-5 py-2 text-sm text-emerald-400">
        ● Online
      </div>

    </div>
  );
}