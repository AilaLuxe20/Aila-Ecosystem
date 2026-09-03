"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ALL_PRODUCTS } from "@/core/constants";

export default function EcosystemSwitcher() {
  const pathname = usePathname();

  const homeActive = pathname === "/";

  return (
    <>
      {/* DESKTOP SWITCHER */}
      <div className="pointer-events-none fixed bottom-5 left-0 right-0 z-[100] hidden justify-center px-5 pb-[env(safe-area-inset-bottom,0px)] lg:flex">
        <nav className="pointer-events-auto flex max-w-[calc(100vw-2.5rem)] items-center gap-1 overflow-x-auto rounded-full border border-white/[0.1] bg-black/75 p-1.5 shadow-[0_20px_80px_rgba(0,0,0,0.65)] backdrop-blur-2xl">
          <Link
            href="/"
            aria-label="Aila Ecosystem home"
            className={`group relative flex h-11 shrink-0 items-center gap-3 overflow-hidden rounded-full border px-4 transition duration-500 ${
              homeActive
                ? "border-white/[0.14] bg-white/[0.08]"
                : "border-transparent hover:border-white/[0.1] hover:bg-white/[0.05]"
            }`}
          >
            {homeActive && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/[0.06] to-transparent" />
            )}

            <div className="relative flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04]">
              {homeActive && (
                <span className="absolute h-4 w-4 animate-ping rounded-full bg-white/10" />
              )}

              <div className="relative h-2 w-2 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.9)]" />
            </div>

            <div className="relative pr-2">
              <p
                className={`text-xs font-medium transition ${
                  homeActive ? "text-white" : "text-neutral-400"
                }`}
              >
                Aila
              </p>

              <p className="text-[8px] uppercase tracking-[0.2em] text-neutral-700">
                Ecosystem
              </p>
            </div>

            {homeActive && (
              <div className="absolute bottom-0 left-1/2 h-px w-8 -translate-x-1/2 bg-white/70 shadow-[0_0_12px_rgba(255,255,255,0.7)]" />
            )}
          </Link>

          <div className="mx-1 h-7 w-px shrink-0 bg-white/[0.08]" />

          {ALL_PRODUCTS.map((product) => {
            const active = pathname.startsWith(product.href);

            return (
              <Link
                key={product.name}
                href={product.href}
                aria-label={product.name}
                className={`group relative flex h-11 shrink-0 items-center gap-2.5 overflow-hidden rounded-full border px-4 transition duration-500 ${
                  active
                    ? `${product.activeBorder} ${product.activeBackground}`
                    : "border-transparent hover:border-white/[0.08] hover:bg-white/[0.04]"
                }`}
              >
                {active && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/[0.035] to-transparent" />
                )}

                <div className="relative flex h-4 w-4 items-center justify-center">
                  {active && (
                    <span
                      className={`absolute h-3 w-3 animate-ping rounded-full opacity-20 ${product.dot}`}
                    />
                  )}

                  <div
                    className={`relative h-1.5 w-1.5 rounded-full transition duration-500 ${
                      product.dot
                    } ${active ? "scale-125" : "opacity-60 group-hover:opacity-100"}`}
                  />
                </div>

                <span
                  className={`relative text-xs transition duration-300 ${
                    active
                      ? product.activeText
                      : "text-neutral-600 group-hover:text-neutral-300"
                  }`}
                >
                  {product.name}
                </span>

                {active && (
                  <div
                    className={`absolute bottom-0 left-1/2 h-px w-8 -translate-x-1/2 ${product.dot}`}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* MOBILE SWITCHER */}
      <nav className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-3 right-3 z-[100] flex gap-1 overflow-x-auto overscroll-x-contain rounded-[22px] border border-white/[0.1] bg-black/85 p-1.5 shadow-[0_20px_80px_rgba(0,0,0,0.75)] backdrop-blur-2xl [-webkit-overflow-scrolling:touch] lg:hidden">
        <Link
          href="/"
          aria-label="Aila Ecosystem"
          className={`relative flex min-h-12 min-w-[4.5rem] shrink-0 flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl border transition duration-300 ${
            homeActive
              ? "border-white/[0.1] bg-white/[0.08]"
              : "border-transparent"
          }`}
        >
          {homeActive && (
            <span className="absolute inset-x-4 top-0 h-px bg-white/60 shadow-[0_0_10px_rgba(255,255,255,0.7)]" />
          )}

          <div className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />

          <span
            className={`text-[9px] ${
              homeActive ? "text-white" : "text-neutral-600"
            }`}
          >
            Aila
          </span>
        </Link>

        {ALL_PRODUCTS.map((product) => {
          const active = pathname.startsWith(product.href);

          return (
            <Link
              key={product.name}
              href={product.href}
              aria-label={product.name}
              className={`relative flex min-h-12 min-w-[4.5rem] shrink-0 flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl border transition duration-300 ${
                active
                  ? `${product.activeBorder} ${product.activeBackground}`
                  : "border-transparent"
              }`}
            >
              {active && (
                <span
                  className={`absolute inset-x-4 top-0 h-px ${product.dot}`}
                />
              )}

              <div
                className={`h-1.5 w-1.5 rounded-full ${product.dot} ${
                  active ? "scale-125" : "opacity-60"
                }`}
              />

              <span
                className={`max-w-full truncate px-1 text-[9px] ${
                  active
                    ? product.activeText
                    : "text-neutral-600"
                }`}
              >
                {product.mobileName}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="h-[calc(6rem+env(safe-area-inset-bottom,0px))] lg:hidden" />
    </>
  );
}
