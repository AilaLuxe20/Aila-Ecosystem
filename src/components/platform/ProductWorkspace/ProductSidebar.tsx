"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarItem {
    name: string;
    href: string;
}

interface ProductSidebarProps {
    product: string;
    items: SidebarItem[];
}

export default function ProductSidebar({
    product,
    items,
}: ProductSidebarProps) {
    const pathname = usePathname();

    return (
        <aside className="flex h-full w-72 flex-col border-r border-white/10 bg-neutral-950">
            <div className="border-b border-white/10 px-6 py-6">
                <h2 className="text-2xl font-bold text-white">
                    {product}
                </h2>

                <p className="mt-1 text-sm text-neutral-400">
                    Enterprise Workspace
                </p>
            </div>

            <nav className="flex-1 space-y-2 p-4">
                {items.map((item) => {
                    const active = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`block rounded-xl px-4 py-3 transition ${active
                                    ? "bg-white text-black"
                                    : "text-neutral-400 hover:bg-white/10 hover:text-white"
                                }`}
                        >
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}