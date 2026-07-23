"use client";

import Link from "next/link";
import { Bell, Search } from "lucide-react";

interface WorkspaceTopbarProps {
    onToggleCopilot?: () => void;
}

export default function WorkspaceTopbar({
    onToggleCopilot,
}: WorkspaceTopbarProps) {
    return (
        <header className="sticky top-0 z-40 border-b border-white/5 bg-black/70 backdrop-blur-xl">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-8">

                <Link href="/dashboard" className="group">
                    <h2 className="text-2xl font-bold text-white transition group-hover:text-cyan-400">
                        Aila Ecosystem
                    </h2>

                    <p className="mt-1 text-sm text-white/50">
                        Enterprise AI Workspace
                    </p>
                </Link>

                <div className="flex items-center gap-4">

                    <div className="relative hidden lg:block">

                        <Search
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                        />

                        <input
                            type="text"
                            placeholder="Search across Aila..."
                            className="w-80 rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/40 outline-none transition-all focus:border-cyan-400"
                        />

                    </div>

                    <button
                        type="button"
                        onClick={onToggleCopilot}
                        className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
                    >
                        Aila AI
                    </button>

                    <button
                        type="button"
                        className="rounded-xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
                    >
                        <Bell
                            size={20}
                            className="text-white"
                        />
                    </button>

                    <button
                        type="button"
                        className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                    >
                        Profile
                    </button>

                </div>

            </div>
        </header>
    );
}