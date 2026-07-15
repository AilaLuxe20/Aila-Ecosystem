"use client";

import { useState } from "react";
import { Code2 } from "lucide-react";

export default function CodeEditor() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  async function improve() {
    if (!code.trim()) return;

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

Improve the following code.

Requirements:
- Fix bugs.
- Optimize performance.
- Improve readability.
- Follow best practices.
- Explain every improvement.

Code:

${code}`,
            },
          ],
        }),
      });

      const data = await res.json();

      setResult(data.reply ?? data.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 rounded-[32px] border border-white/10 bg-[#07101f]/70 p-8">

      <div className="flex items-center gap-3">
        <Code2 className="text-cyan-400" />
        <h2 className="text-2xl font-bold">
          AI Code Editor
        </h2>
      </div>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Paste your code here..."
        className="h-72 w-full rounded-2xl border border-white/10 bg-[#0d1729] p-5 font-mono outline-none"
      />

      <button
        onClick={improve}
        disabled={loading}
        className="rounded-2xl bg-cyan-500 px-8 py-4 font-bold text-black hover:bg-cyan-400"
      >
        {loading ? "Analyzing..." : "Improve Code"}
      </button>

      {result && (
        <pre className="overflow-auto rounded-2xl border border-cyan-500/20 bg-[#0d1729] p-6 whitespace-pre-wrap">
{result}
        </pre>
      )}

    </div>
  );
}
