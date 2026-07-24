"use client";

/**
 * Command Palette
 *
 * A full-screen command palette component for the Aila Command Center.
 * Supports keyboard navigation, fuzzy search, and category grouping.
 *
 * Usage:
 *   <CommandPalette />
 *
 * The palette can be opened/closed programmatically via the
 * `commandPaletteOpen` event or by setting `isOpen` directly.
 */

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import { commandRegistry } from "./CommandRegistry";
import { commandSearch } from "./CommandSearch";
import { registerDefaultCommands } from "./defaultCommands";
import type { Command, CommandCategory } from "./types";
import { COMMAND_CATEGORY_LABELS } from "./CommandCategory";

interface CommandPaletteProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function CommandPalette({
  isOpen: controlledOpen,
  onClose,
}: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const isOpen =
    controlledOpen !== undefined
      ? controlledOpen
      : internalOpen;

  // Ensure default commands are registered
  useEffect(() => {
    registerDefaultCommands();
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (onClose) {
          onClose();
        } else {
          setInternalOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () =>
      window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  // Search results
  const results = useMemo(() => {
    const allCommands = commandRegistry.getAll();
    const searchResults = commandSearch.search(
      allCommands,
      query,
      20
    );
    return searchResults.map((r) => r.command);
  }, [query]);

  // Grouped results (when no query)
  const groupedCommands = useMemo(() => {
    const allCommands = commandRegistry.getAll();
    const enabled = commandSearch.filterEnabled(allCommands);
    const sorted = commandSearch.sortCommands(enabled);
    return commandSearch.groupByCategory(sorted);
  }, []);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalOpen(false);
    }
    setQuery("");
    setSelectedIndex(0);
  };

  const handleExecute = async (command: Command) => {
    await commandRegistry.execute(command.id);
    handleClose();
  };

  if (!isOpen) return null;

  const displayResults = query.trim()
    ? results
    : Array.from(groupedCommands.entries()).flatMap(
        ([, cmds]) => cmds
      );

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/60 pt-32 backdrop-blur-md"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#090909]/95 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="relative border-b border-white/10 p-4">
          <Search
            className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40"
            size={20}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((i) =>
                  Math.min(i + 1, Math.max(displayResults.length - 1, 0))
                );
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((i) => Math.max(i - 1, 0));
              }
              if (e.key === "Enter" && displayResults.length > 0) {
                e.preventDefault();
                handleExecute(displayResults[selectedIndex]);
              }
            }}
            placeholder="Search commands..."
            className="w-full bg-transparent py-3 pl-12 pr-4 text-sm text-white placeholder:text-white/40 outline-none"
            autoFocus
          />
          <button
            onClick={handleClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1 text-white/40 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[450px] overflow-y-auto p-2">
          {displayResults.length === 0 ? (
            <div className="p-8 text-center text-white/40">
              No matching commands.
            </div>
          ) : query.trim() ? (
            // Flat list when searching
            displayResults.map((command, index) => (
              <div
                key={command.id}
                onClick={() => handleExecute(command)}
                className={`flex items-center gap-4 rounded-xl px-4 py-3 cursor-pointer transition ${
                  index === selectedIndex
                    ? "bg-white/10"
                    : "hover:bg-white/5"
                }`}
              >
                {command.icon && (
                  <span className="text-lg">{command.icon}</span>
                )}
                <div className="flex-1">
                  <p className="font-medium text-white">
                    {command.label}
                  </p>
                  {command.description && (
                    <p className="text-xs text-neutral-500">
                      {command.description}
                    </p>
                  )}
                </div>
                {command.shortcut && (
                  <kbd className="rounded bg-white/10 px-2 py-1 text-xs text-neutral-400">
                    {command.shortcut}
                  </kbd>
                )}
              </div>
            ))
          ) : (
            // Grouped by category when no query
            Array.from(groupedCommands.entries()).map(
              ([category, commands]) => (
                <div key={category} className="mb-4">
                  <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    {COMMAND_CATEGORY_LABELS[category] ||
                      category}
                  </h3>
                  {commands.map((command, index) => (
                    <div
                      key={command.id}
                      onClick={() => handleExecute(command)}
                      className="flex items-center gap-4 rounded-xl px-4 py-3 cursor-pointer transition hover:bg-white/5"
                    >
                      {command.icon && (
                        <span className="text-lg">
                          {command.icon}
                        </span>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-white">
                          {command.label}
                        </p>
                        {command.description && (
                          <p className="text-xs text-neutral-500">
                            {command.description}
                          </p>
                        )}
                      </div>
                      {command.shortcut && (
                        <kbd className="rounded bg-white/10 px-2 py-1 text-xs text-neutral-400">
                          {command.shortcut}
                        </kbd>
                      )}
                    </div>
                  ))}
                </div>
              )
            )
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 text-xs text-neutral-500">
          <div className="flex items-center gap-4">
            <span>
              <kbd className="rounded bg-white/10 px-2 py-1">
                ↑↓
              </kbd>{" "}
              Navigate
            </span>
            <span>
              <kbd className="rounded bg-white/10 px-2 py-1">
                Enter
              </kbd>{" "}
              Open
            </span>
          </div>
          <span>
            <kbd className="rounded bg-white/10 px-2 py-1">
              Esc
            </kbd>{" "}
            Close
          </span>
        </div>
      </div>
    </div>
  );
}

// Global event listeners for opening/closing the palette
export function openCommandPalette() {
  const event = new CustomEvent("aila:openCommandPalette");
  window.dispatchEvent(event);
}

export function closeCommandPalette() {
  const event = new CustomEvent("aila:closeCommandPalette");
  window.dispatchEvent(event);
}
