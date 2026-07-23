"use client";

import Link from "next/link";
import { products } from "@/core/registry";

export default function ProductLauncher() {
    return (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
                <Link
                    key={product.id}
                    href={product.route}
                    className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-cyan-400/40"
                >
                    <h3 className="text-xl font-semibold text-white">
                        {product.name}
                    </h3>

                    <p className="mt-3 text-neutral-400">
                        {product.description}
                    </p>
                </Link>
            ))}
        </div>
    );
}