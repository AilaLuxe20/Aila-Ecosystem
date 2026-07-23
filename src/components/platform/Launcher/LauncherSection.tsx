"use client";

import { ReactNode } from "react";

interface LauncherSectionProps {
    title: string;
    children: ReactNode;
}

export default function LauncherSection({
    title,
    children,
}: LauncherSectionProps) {
    return (
        <section className="py-2">
            <div className="px-4 pb-2">
                <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
                    {title}
                </h3>
            </div>

            <div className="space-y-1">
                {children}
            </div>
        </section>
    );
}