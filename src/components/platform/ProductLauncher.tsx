"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";

import { products } from "@/config/products";
import { usePlatformContext } from "@/core/platform/providers/PlatformProvider";

import LauncherSearch from "./Launcher/LauncherSearch";
import LauncherItem from "./Launcher/LauncherItem";

export default function ProductLauncher() {
    const router = useRouter();

    const {
        state,
        closeLauncher,
        openWorkspace,
    } = usePlatformContext();

    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState(0);

    const results = useMemo(() => {
        return products.filter((product) => {
            if (product.status === "system") return false;

            const search = query.toLowerCase();

            return (
                product.name.toLowerCase().includes(search) ||
                product.description.toLowerCase().includes(search)
            );
        });
    }, [query]);

    useEffect(() => {
        if (!state.launcherOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            switch (event.key) {
                case "Escape":
                    closeLauncher();
                    break;

                case "ArrowDown":
                    event.preventDefault();
                    setSelected((current) =>
                        Math.min(current + 1, Math.max(results.length - 1, 0))
                    );
                    break;

                case "ArrowUp":
                    event.preventDefault();
                    setSelected((current) => Math.max(current - 1, 0));
                    break;

                case "Enter": {
                    const product = results[selected];

                    if (!product) return;

                    openWorkspace(product.href);
                    router.push(product.href);
                    closeLauncher();
                    break;
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [
        state.launcherOpen,
        results,
        selected,
        router,
        openWorkspace,
        closeLauncher,
    ]);

    useEffect(() => {
        setSelected(0);
    }, [query]);

    return (
        <AnimatePresence>
            {state.launcherOpen && (
                <motion.div
                    className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/60 pt-32 backdrop-blur-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={closeLauncher}
                >
                    <motion.div
                        className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#090909]/95 shadow-2xl"
                        initial={{
                            opacity: 0,
                            y: -30,
                            scale: 0.97,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                            y: -30,
                        }}
                        transition={{
                            duration: 0.2,
                        }}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <LauncherSearch
                            value={query}
                            onChange={setQuery}
                        />

                        <div className="max-h-[450px] overflow-y-auto p-2">
                            {results.length > 0 ? (
                                results.map((product, index) => (
                                    <LauncherItem
                                        key={product.id}
                                        icon={product.icon}
                                        title={product.name}
                                        description={product.description}
                                        selected={selected === index}
                                        onClick={() => {
                                            openWorkspace(product.href);
                                            router.push(product.href);
                                            closeLauncher();
                                        }}
                                    />
                                ))
                            ) : (
                                <div className="p-10 text-center text-white/40">
                                    No matching products.
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}