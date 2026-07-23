"use client";

import { Search } from "lucide-react";

interface LauncherSearchProps {
    value: string;
    onChange: (value: string) => void;
}

export default function LauncherSearch({
    value,
    onChange,
}: LauncherSearchProps) {
    return (
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
            <Search className="h-5 w-5 text-white/40" />

            <input
                autoFocus
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Search Aila..."
                className="w-full bg-transparent text-lg outline-none placeholder:text-white/30"
            />
        </div>
    );
}