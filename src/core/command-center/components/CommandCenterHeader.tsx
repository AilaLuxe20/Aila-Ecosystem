"use client";

import { Command } from "lucide-react";

interface CommandCenterHeaderProps {
  onPaletteOpen: () => void;
}

export default function CommandCenterHeader({
  onPaletteOpen,
}: CommandCenterHeaderProps) {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-luxury-cyan/20 bg-luxury-cyan/[0.05]">
          <Command className="h-6 w-6 text-luxury-cyan" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">
            Command Center
          </h1>
          <p className="text-sm text-neutral-500">
            Central control panel for the Aila Ecosystem
          </p>
        </div>
      </div>

      <button
        onClick={onPaletteOpen}
        className="mt-6 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-2 text-xs text-neutral-400 transition hover:border-luxury-cyan/20 hover:text-luxury-cyan"
      >
        Press <kbd className="mx-1 rounded bg-white/10 px-1.5 py-0.5 text-xs">⌘K</kbd>
        to open command palette
      </button>
    </div>
  );
}
