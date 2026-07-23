"use client";

import { ReactNode } from "react";
import ProductHeader from "./ProductHeader";
import ProductContent from "./ProductContent";

interface ProductWorkspaceProps {
    title: string;
    description: string;
    children: ReactNode;
}

export default function ProductWorkspace({
    title,
    description,
    children,
}: ProductWorkspaceProps) {
    return (
        <main className="min-h-screen bg-neutral-950 text-white">
            <div className="mx-auto max-w-7xl px-8 py-10">
                <ProductHeader
                    title={title}
                    description={description}
                />

                <ProductContent>
                    {children}
                </ProductContent>
            </div>
        </main>
    );
}