"use client";

import { ReactNode } from "react";

interface ProductSectionProps {
    title: string;
    children: ReactNode;
}

export default function ProductSection({
    title,
    children,
}: ProductSectionProps) {
    return (
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="mb-6 text-xl font-semibold text-white">
                {title}
            </h2>

            {children}
        </section>
    );
}