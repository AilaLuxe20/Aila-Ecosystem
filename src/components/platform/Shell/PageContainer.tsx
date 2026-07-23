"use client";

import { ReactNode } from "react";

interface PageContainerProps {
    title: string;
    description?: string;
    children: ReactNode;
}

export default function PageContainer({
    title,
    description,
    children,
}: PageContainerProps) {
    return (
        <section className="mx-auto max-w-7xl space-y-8">
            <header>
                <h1 className="text-4xl font-bold text-white">
                    {title}
                </h1>

                {description && (
                    <p className="mt-2 text-white/60">
                        {description}
                    </p>
                )}
            </header>

            {children}
        </section>
    );
}