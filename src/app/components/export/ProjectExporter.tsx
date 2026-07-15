"use client";

import { Download } from "lucide-react";

export default function ProjectExporter() {
  function exportProject() {
    alert(
`Project export is the next stage.

This will generate:

• Next.js project
• React components
• Tailwind
• API routes
• Prisma schema
• package.json
• README
• .env.example
• ZIP download`
    );
  }

  return (
    <div className="space-y-6 rounded-[32px] border border-white/10 bg-[#07101f]/70 p-8">

      <div className="flex items-center gap-3">
        <Download className="text-cyan-400" />

        <h2 className="text-2xl font-bold">
          AI Project Export
        </h2>
      </div>

      <p className="text-white/70">
        Export your generated project into a production-ready starter.
      </p>

      <button
        onClick={exportProject}
        className="rounded-2xl bg-cyan-500 px-8 py-4 font-bold text-black hover:bg-cyan-400"
      >
        Export Project
      </button>

    </div>
  );
}
