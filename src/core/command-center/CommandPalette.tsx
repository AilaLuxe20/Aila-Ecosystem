"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { commandRegistry } from "./CommandRegistry";
import type { Command, CommandCategory } from "./types";

const CATEGORY_LABELS: Record<CommandCategory, string> = {
  system: "System",
  navigation: "Navigation",
  product: "Products",
  ai: "AI",
  workspace: "Workspace",
  settings: "Settings",
  developer: "Developer",
};

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onExecute?: (command: Command) => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onExecute,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Command[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults(commandRegistry.getAll());
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim()) {
      setResults(commandRegistry.search(query));
    } else {
      setResults(commandRegistry.getAll());
    }
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () =>
      document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleExecute = useCallback(
    async (command: Command) => {
      await commandRegistry.execute(command.id);
      onExecute?.(command);
      onClose();
    },
    [onExecute, onClose]
  );

  if (!isOpen) return null;

  const grouped = results.reduce(
    (acc, cmd) => {
      const cat = cmd.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(cmd);
      return acc;
    },
    {} as Record<string, Command[]>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
    >
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#080808] shadow-2xl">
        <div className="border-b border-white/10 p-4">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-neutral-500"
          />
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="p-4 text-center text-sm text-neutral-500">
              No commands found.
            </div>
          ) : (
            Object.entries(grouped).map(([category, cmds]) => (
              <div key={category} className="mb-3">
                <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  {CATEGORY_LABELS[
                    category as CommandCategory
                  ] || category}
                </div>
                {cmds.map((cmd) => (
                  <button
                    key={cmd.id}
                    onClick={() => handleExecute(cmd)}
                    disabled={cmd.enabled === false}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-neutral-300 hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
                  >
                    {cmd.icon && (
                      <span className="text-neutral-500">
                        {cmd.icon}
                      </span>
                    )}
                    <div className="flex-1">
                      <div>{cmd.label}</div>
                      {cmd.description && (
                        <div className="text-xs text-neutral-600">
                          {cmd.description}
                        </div>
                      )}
                    </div>
                    {cmd.shortcut && (
                      <kbd className="rounded bg-white/10 px-2 py-1 text-xs text-neutral-400">
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
