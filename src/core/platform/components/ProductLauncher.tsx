"use client";

import Link from "next/link";
import { products } from "@/config/products";

export default function ProductLauncher() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((product) => {
                const Icon = product.icon;

                return (
                    <Link
                        key={product.id}
                        href={product.href}
                        className="rounded-2xl border p-6 transition hover:shadow-xl hover:scale-[1.02]"
                    >
                        <Icon className="w-8 h-8 mb-4" />

                        <h3 className="font-semibold text-lg">
                            {product.name}
                        </h3>

                        <p className="text-sm opacity-70 mt-2">
                            {product.description}
                        </p>

                        <div className="mt-4 text-xs">
                            {product.status}
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}