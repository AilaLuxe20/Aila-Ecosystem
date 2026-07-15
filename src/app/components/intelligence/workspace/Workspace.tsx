"use client";

import { useState } from "react";
import { MessageSquare, Mic, Image, FileText, WandSparkles, Cpu, Code2, FolderGit2 } from "lucide-react";
import WorkspaceContent from "./WorkspaceContent";

export default function Workspace() {
  const [tab, setTab] = useState("chat");

  const tabs = [
    { id: "chat", label: "Chat", icon: MessageSquare },
    { id: "voice", label: "Voice", icon: Mic },
    { id: "vision", label: "Vision", icon: Image },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "website", label: "Website AI", icon: WandSparkles },
    { id: "app", label: "App AI", icon: Cpu },
    { id: "editor", label: "Code AI", icon: Code2 },
    { id: "builder", label: "Project AI", icon: FolderGit2 },
  ];

  return (
    <section className="rounded-[36px] border border-white/10 bg-[#07101f]/70 p-8 backdrop-blur-xl">

      <div className="mb-8 flex flex-wrap gap-3">
        {tabs.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={
                "flex items-center gap-2 rounded-2xl px-5 py-3 font-semibold transition " +
                (tab === item.id
                  ? "bg-cyan-500 text-black"
                  : "bg-[#0d1729] text-white hover:bg-[#16233a]")
              }
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </div>

      <WorkspaceContent tab={tab} />

    </section>
  );
}




