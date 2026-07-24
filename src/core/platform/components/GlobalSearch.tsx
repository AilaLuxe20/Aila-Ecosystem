"use client";

/**
 * Global Search (Core)
 *
 * Core platform component for global search across the Aila Ecosystem.
 * Integrates with the Command Center's command search and the
 * product registry to provide unified search results.
 *
 * Searches across:
 * - Products (by name, description)
 * - Commands (by label, description)
 * - Navigation items
 */

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Command, Search, X } from "lucide-react";

import { products } from "@/config/products";
import { commandRegistry } from "@/core/command-center/CommandRegistry";
import { usePlatformContext } from "../providers/PlatformProvider";
import { mainNavigation } from "../navigation";

type SearchResult = {
  id: string;
  type: "product" | "command" | "navigation";
  title: string;
  description: string;
  icon?: string | React.ComponentType<{ size?: number; className?: string }>;
  href?: string;
  action?: () => void;
};

export default function GlobalSearch() {
  const router = useRouter();

  const { state, closeSearch, openWorkspace } =
    usePlatformContext();

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);

  const results: SearchResult[] = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const matches: SearchResult[] = [];

    // Search products
    for (const product of products) {
      if (product.status === "system") continue;

      if (
        product.name.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q)
      ) {
        matches.push({
          id: `product-${product.id}`,
          type: "product",
          title: product.name,
          description: product.description,
          icon: product.icon,
          href: product.href,
        });
      }
    }

    // Search commands
    const commands = commandRegistry.search(q, 10);
    for (const cmd of commands) {
      matches.push({
        id: `command-${cmd.id}`,
        type: "command",
        title: cmd.label,
        description: cmd.description || "",
        icon: cmd.icon,
        action: () => {
          commandRegistry.execute(cmd.id);
        },
      });
    }

    // Search navigation
    for (const nav of mainNavigation) {
      if (
        nav.label.toLowerCase().includes(q) ||
        nav.href.toLowerCase().includes(q)
      ) {
        matches.push({
          id: `nav-${nav.label}`,
          type: "navigation",
          title: nav.label,
          description: nav.href,
          icon: "🧭",
          href: nav.href,
        });
      }
    }

    return matches.slice(0, 20);
  }, [query]);

  useEffect(() => {
    if (!state.searchOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "Escape":
          closeSearch();
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
          const result = results[selected];
          if (!result) return;

          if (result.action) {
            result.action();
          } else if (result.href) {
            if (result.type === "product") {
              openWorkspace(result.href);
            }
            router.push(result.href);
          }

          closeSearch();
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    state.searchOpen,
    results,
    selected,
    router,
    closeSearch,
    openWorkspace,
  ]);

  const getTypeLabel = (type: SearchResult["type"]) => {
    switch (type) {
      case "product":
        return "Product";
      case "command":
        return "Command";
      case "navigation":
        return "Navigation";
    }
  };

  const getTypeColor = (type: SearchResult["type"]) => {
    switch (type) {
      case "product":
        return "text-luxury-cyan";
      case "command":
        return "text-violet-400";
      case "navigation":
        return "text-emerald-400";
    }
  };

  if (!state.searchOpen) return null;

  return (
    <AnimatePresence>
      {state.searchOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/60 pt-32 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeSearch}
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
            transition={{ duration: 0.2 }}
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
                placeholder="Search across Aila..."
                className="w-full bg-transparent py-3 pl-12 pr-4 text-sm text-white placeholder:text-white/40 outline-none"
                autoFocus
              />
              <button
                onClick={closeSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1 text-white/40 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[450px] overflow-y-auto p-2">
              {results.length > 0 ? (
                results.map((result, index) => {
                  const IconComponent =
                    typeof result.icon === "string" || !result.icon
                      ? null
                      : result.icon;

                  return (
                    <motion.div
                      key={result.id}
                      onClick={() => {
                        if (result.action) {
                          result.action();
                        } else if (result.href) {
                          if (result.type === "product") {
                            openWorkspace(result.href);
                          }
                          router.push(result.href);
                        }
                        closeSearch();
                      }}
                      className={`flex items-center gap-4 rounded-xl px-4 py-3 cursor-pointer transition ${index === selected
                        ? "bg-white/10"
                        : "hover:bg-white/5"
                        }`}
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                        {IconComponent && (
                          <IconComponent
                            size={22}
                            className="text-luxury-cyan"
                          />
                        )}
                        {typeof result.icon === "string" && (
                          <span className="text-lg">
                            {result.icon}
                          </span>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white">
                            {result.title}
                          </p>
                          <span
                            className={`text-xs font-medium ${getTypeColor(result.type)}`}
                          >
                            {getTypeLabel(result.type)}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500">
                          {result.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="p-10 text-center text-white/40">
                  No matching results.
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