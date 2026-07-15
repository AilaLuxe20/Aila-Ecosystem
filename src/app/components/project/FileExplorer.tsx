"use client";

import { GeneratedProject } from "@/lib/project/types";
import { Folder, FileCode2 } from "lucide-react";

type Props = {
  project: GeneratedProject | null;
};

export default function FileExplorer({
  project,
}: Props) {
  if (!project) {
    return (
      <div className="rounded-3xl border border-white/10 bg-[#07101f]/70 p-8 text-white/60">
        No project generated yet.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-[#07101f]/70 p-6">

      <div className="mb-6 flex items-center gap-2">
        <Folder className="text-cyan-400" />
        <h2 className="text-xl font-bold">{project.name}</h2>
      </div>

      <div className="space-y-3">
        {project.files.map((file) => (
          <div
            key={file.path}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0d1729] p-3"
          >
            <FileCode2 size={18} />
            <span className="font-mono text-sm">
              {file.path}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}
