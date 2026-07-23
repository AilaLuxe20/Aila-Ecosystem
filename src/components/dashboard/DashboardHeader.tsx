"use client";

import { Bell, Search } from "lucide-react";

export default function DashboardHeader() {
    return (
        <header className="sticky top-0 z-40 border-b border-white/5 bg-black/70 backdrop-blur-xl">
            <div className="flex h-20 items-center justify-between px-8">

                <div>
                    <h1 className="text-3xl font-bold text-white">
                        Dashboard
                    </h1>

                    <p className="mt-1 text-sm text-white/50">
                        Welcome back to Aila OS
                    </p>
                </div>

                <div className="flex items-center gap-4">

                    <div className="relative">

                        <Search
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                        />

                        <input
                            placeholder="Search Aila..."
                            className="w-80 rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-white outline-none transition focus:border-cyan-400"
                        />

                    </div>

                    <button
                        className="rounded-xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
                    >
                        <Bell
                            size={20}
                            className="text-white"
                        />
                    </button>

                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-500 text-sm font-bold text-black">
                        AI
                    </div>

                </div>

            </div>
        </header>
    );
}