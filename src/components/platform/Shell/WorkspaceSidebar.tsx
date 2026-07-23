"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PRODUCTS } from "@/core/products";

export default function WorkspaceSidebar() {
    const pathname = usePathname();

    const enabledProducts = PRODUCTS.filter(
        (product) => product.enabled
    );

    return (
        <aside className="flex w-72 flex-col border-r border-white/10 bg-black">
            <div className="border-b border-white/10 p-6">
                <h1 className="text-3xl font-bold">AILA</h1>

                <p className="mt-2 text-sm text-neutral-400">
                    Enterprise AI Operating System
                </p>
            </div>

            <nav className="flex-1 space-y-2 p-4">
                {enabledProducts.map((product) => {
                    const active = pathname.startsWith(product.route);

                    return (
                        <Link
                            key={product.id}
                            href={product.route}
                            className={`block rounded-xl px-4 py-3 transition ${active
                                    ? "bg-white text-black"
                                    : "hover:bg-white/10"
                                }`}
                        >
                            <div className="font-medium">
                                {product.name}
                            </div>

                            <div className="mt-1 text-xs opacity-70">
                                {product.description}
                            </div>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}