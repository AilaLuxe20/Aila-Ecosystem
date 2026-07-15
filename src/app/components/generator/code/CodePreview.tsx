"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";

type Props = {
  code: string;
};

export default function CodePreview({
  code,
}: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(code);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  if (!code) return null;

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#050816]">

      <div className="flex items-center justify-between border-b border-white/10 bg-[#0d1729] px-5 py-4">

        <h3 className="font-semibold">
          Generated React + Tailwind Code
        </h3>

        <button
          onClick={copy}
          className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 font-semibold text-black transition hover:bg-cyan-400"
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
          {copied ? "Copied" : "Copy"}
        </button>

      </div>

      <pre className="max-h-[700px] overflow-auto p-6 text-sm text-green-300">
        <code>{code}</code>
      </pre>

    </div>
  );
}
