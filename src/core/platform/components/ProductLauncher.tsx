"use client";

/**
 * Product Launcher (Core)
 *
 * Core platform component for launching Aila products.
 * Integrates with the PlatformContext for workspace management
 * and the Command Center for command-based navigation.
 *
 * This component provides a searchable launcher overlay that
 * displays all available products with their icons, names, and
 * descriptions.
 */

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

import { products } from "@/config/products";
import { usePlatformContext } from "../providers/PlatformProvider";

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
            Math.min(
              current + 1,
              Math.max(results.length - 1, 0)
            )
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
            {/* Search input */}
            <div className="relative border-b border-white/10 p-4">
              <Search
                className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40"
                size={20}
              />
              <input
                type="text"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSelected(0);
                }}
                placeholder="Search products..."
                className="w-full bg-transparent py-3 pl-12 pr-4 text-sm text-white placeholder:text-white/40 outline-none"
                autoFocus
              />
              <button
                onClick={closeLauncher}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1 text-white/40 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[450px] overflow-y-auto p-2">
              {results.length > 0 ? (
                results.map((product, index) => {
                  const Icon = product.icon;

                  return (
                    <motion.div
                      key={product.id}
                      onClick={() => {
                        openWorkspace(product.href);
                        router.push(product.href);
                        closeLauncher();
                      }}
                      className={`flex items-center gap-4 rounded-xl px-4 py-3 cursor-pointer transition ${
                        index === selected
                          ? "bg-white/10"
                          : "hover:bg-white/5"
                      }`}
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                        {Icon && (
                          <Icon
                            size={22}
                            className="text-luxury-cyan"
                          />
                        )}
                      </div>

                      <div className="flex-1">
                        <p className="font-medium text-white">
                          {product.name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {product.description}
                        </p>
                      </div>

                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                          product.status === "live"
                            ? "bg-green-500/10 text-green-400"
                            : product.status === "building"
                              ? "bg-yellow-500/10 text-yellow-400"
                              : "bg-gray-500/10 text-gray-400"
                        }`}
                      >
                        {product.status}
                      </span>
                    </motion.div>
                  );
                })
              ) : (
                <div className="p-10 text-center text-white/40">
                  No matching products.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 text-xs text-neutral-500">
              <div className="flex items-center gap-4">
                <span>
                  <kbd className="rounded bg-white/10 px-2 py-1">
                    ↑↓
                  </kbd>{" "}
                  Navigate
                </span>
                <span>
                  <kbd className="rounded bg-white/10 px-2 py-1">
                    Enter
                  </kbd>{" "}
                  Open
                </span>
              </div>
              <span>
                <kbd className="rounded bg-white/10 px-2 py-1">
                  Esc
                </kbd>{" "}
                Close
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
