"use client";

import { LucideIcon } from "lucide-react";

export interface LauncherItemProps {
    icon: LucideIcon;
    title: string;
    description: string;
    selected?: boolean;
    onClick?: () => void;
}

export default function LauncherItem({
    icon: Icon,
    title,
    description,
    selected = false,
    onClick,
}: LauncherItemProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 ${selected
                    ? "border-white/10 bg-white/10"
                    : "border-transparent hover:border-white/10 hover:bg-white/5"
                }`}
        >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5">
                <Icon className="h-6 w-6 text-luxury-cyan" />
            </div>

            <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-white">
                    {title}
                </h3>

                <p className="truncate text-sm text-white/50">
                    {description}
                </p>
            </div>
        </button>
    );
}