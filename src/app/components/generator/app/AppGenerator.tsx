"use client";

import { useState } from "react";
import { Cpu } from "lucide-react";
import CodePreview from "../code/CodePreview";

export default function AppGenerator() {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");

  async function generate() {
    if (!idea.trim()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `You are Aila Intelligence.

Generate a complete production-quality Next.js 16 + React 19 + Tailwind CSS app.

Return ONLY code.

No markdown.

No explanations.

App idea:
${idea}`,
            },
          ],
        }),
      });

      const data = await res.json();

      setCode(data.reply ?? data.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 rounded-[32px] border border-white/10 bg-[#07101f]/70 p-8">

      <div className="flex items-center gap-3">
        <Cpu className="text-cyan-400" />
        <h2 className="text-2xl font-bold">
          AI App Generator
        </h2>
      </div>

      <textarea
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        placeholder="Example: Build an AI CRM SaaS..."
        className="h-40 w-full rounded-2xl border border-white/10 bg-[#0d1729] p-5 outline-none"
      />

      <button
        onClick={generate}
        disabled={loading}
        className="rounded-2xl bg-cyan-500 px-8 py-4 font-bold text-black hover:bg-cyan-400"
      >
        {loading ? "Generating..." : "Generate App"}
      </button>

      <CodePreview code={code} />

    </div>
  );
}
