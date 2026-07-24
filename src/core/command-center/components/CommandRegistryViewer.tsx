"use client";

import { useState } from "react";
import { commandRegistry } from "@/core/command-center/CommandRegistry";
import type { Command, CommandCategory } from "@/core/command-center/types";

const CATEGORY_LABELS: Record<CommandCategory, string> = {
  system: "System",
  navigation: "Navigation",
  product: "Products",
  ai: "AI",
  workspace: "Workspace",
  settings: "Settings",
  developer: "Developer",
};

export default function CommandRegistryViewer() {
  const [commands] = useState(() => commandRegistry.getAll());

  const grouped = commands.reduce(
    (acc, cmd) => {
      const cat = cmd.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(cmd);
      return acc;
    },
    {} as Record<string, Command[]>
  );

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-[#080808]/80 p-8 backdrop-blur-xl">
      <h2 className="mb-6 text-xl font-semibold text-white">
        Registered Commands ({commands.length})
      </h2>

      <div className="space-y-6">
        {Object.entries(grouped).map(([category, cmds]) => (
          <div key={category}>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              {CATEGORY_LABELS[category as CommandCategory] ||
                category}
            </h3>

            <div className="space-y-2">
              {cmds.map((cmd) => (
                <div
                  key={cmd.id}
                  className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-black/30 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    {cmd.icon && (
                      <span className="text-neutral-500">
                        {cmd.icon}
                      </span>
                    )}
                    <div>
                      <p className="font-medium text-white">
                        {cmd.label}
                      </p>
                      {cmd.description && (
                        <p className="text-xs text-neutral-600">
                          {cmd.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {cmd.shortcut && (
                      <kbd className="rounded bg-white/10 px-2 py-1 text-xs text-neutral-400">
                        {cmd.shortcut}
                      </kbd>
                    )}
                    <span
                      className={`text-xs ${
                        cmd.enabled === false
                          ? "text-red-400"
                          : "text-green-400"
                      }`}
                    >
                      {cmd.enabled === false
                        ? "disabled"
                        : "active"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
