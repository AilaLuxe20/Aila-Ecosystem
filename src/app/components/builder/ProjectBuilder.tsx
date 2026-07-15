"use client";

import { useState } from "react";
import { FolderGit2 } from "lucide-react";
import FileExplorer from "@/app/components/project/FileExplorer";
import { GeneratedProject } from "@/lib/project/types";

export default function ProjectBuilder() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<GeneratedProject | null>(null);
  const [error, setError] = useState("");

  async function generate() {
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/project/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Generation failed.");
      }

      setProject(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unknown error."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 rounded-[32px] border border-white/10 bg-[#07101f]/70 p-8">

      <div className="flex items-center gap-3">
        <FolderGit2 className="text-cyan-400" />
        <h2 className="text-2xl font-bold">
          AI Project Builder
        </h2>
      </div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the application you want to build..."
        className="h-40 w-full rounded-2xl border border-white/10 bg-[#0d1729] p-5 outline-none"
      />

      <button
        onClick={generate}
        disabled={loading}
        className="rounded-2xl bg-cyan-500 px-8 py-4 font-bold text-black hover:bg-cyan-400"
      >
        {loading ? "Generating..." : "Generate Project"}
      </button>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}

      <FileExplorer project={project} />

    </div>
  );
}
