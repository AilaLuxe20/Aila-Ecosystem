"use client";

import Link from "next/link";
import { PRODUCTS } from "@/core/products";

export default function AppSidebar() {
    return (
        <aside className="w-72 border-r border-white/10 bg-black/40 backdrop-blur-xl">
            <div className="p-6">
                <h1 className="text-2xl font-bold">
                    Aila
                </h1>

                <p className="mt-1 text-sm text-white/60">
                    Enterprise AI Platform
                </p>
            </div>

            <nav className="px-4 space-y-2">
                {PRODUCTS.filter(x => x.enabled).map(product => (
                    <Link
                        key={product.id}
                        href={product.route}
                        className="block rounded-xl px-4 py-3 hover:bg-white/10 transition"
                    >
                        <div className="font-medium">
                            {product.name}
                        </div>

                        <div className="text-xs text-white/50">
                            {product.description}
                        </div>
                    </Link>
                ))}
            </nav>
        </aside>
    );
}