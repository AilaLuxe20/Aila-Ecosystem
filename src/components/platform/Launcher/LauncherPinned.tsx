"use client";

import { products } from "@/config/products";
import LauncherItem from "./LauncherItem";

interface LauncherPinnedProps {
    onOpen: (href: string) => void;
}

export default function LauncherPinned({
    onOpen,
}: LauncherPinnedProps) {
    const pinned = products.slice(0, 3);

    return (
        <>
            {pinned.map((product) => (
                <LauncherItem
                    key={product.id}
                    icon={product.icon}
                    title={product.name}
                    description={product.description}
                    onClick={() => onOpen(product.href)}
                />
            ))}
        </>
    );
}