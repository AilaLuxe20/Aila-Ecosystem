"use client";

import { useState } from "react";
import { WandSparkles } from "lucide-react";
import CodePreview from "./code/CodePreview";

export default function WebsiteGenerator() {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
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
              content:
                `You are Aila Intelligence.

Generate ONLY production-quality React + Tailwind JSX.

Rules:
- Return only code.
- No markdown.
- No explanations.
- Build a beautiful responsive website.

Website request:
${idea}`,
            },
          ],
        }),
      });

      const data = await res.json();

      const reply = data.reply ?? data.error;

setResult(reply);

setCode(reply);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 rounded-[32px] border border-white/10 bg-[#07101f]/70 p-8">

      <div className="flex items-center gap-3">
        <WandSparkles className="text-cyan-400" />
        <h2 className="text-2xl font-bold">
          AI Website Generator
        </h2>
      </div>

      <textarea
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        placeholder="Example: Build a luxury real estate website..."
        className="h-40 w-full rounded-2xl border border-white/10 bg-[#0d1729] p-5 outline-none"
      />

      <button
        onClick={generate}
        disabled={loading}
        className="rounded-2xl bg-cyan-500 px-8 py-4 font-bold text-black hover:bg-cyan-400"
      >
        {loading ? "Generating..." : "Generate Website"}
      </button>

      {result && (
        <>
          <div className="rounded-2xl border border-cyan-500/20 bg-[#0d1729] p-6 whitespace-pre-wrap">
            {result}
          </div>

          <CodePreview code={code} />
        </>
      )}

    </div>
  );
}


