"use client";

import { products } from "@/config/products";
import LauncherItem from "./LauncherItem";

interface LauncherRecentProps {
    onOpen: (href: string) => void;
}

export default function LauncherRecent({
    onOpen,
}: LauncherRecentProps) {
    const recent = products.slice(0, 4);

    return (
        <>
            {recent.map((product) => (
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