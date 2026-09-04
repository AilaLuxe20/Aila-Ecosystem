"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth, UserButton } from "@clerk/nextjs";
import { groupedNavProducts } from "@/core/constants";

const navigation = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Services",
    href: "/#services",
  },
];

const navGroups = groupedNavProducts();

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const productsRef = useRef<HTMLDivElement>(null);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const overflow = menuOpen ? "hidden" : "";
    document.documentElement.style.overflow = overflow;
    document.body.style.overflow = overflow;

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!productsRef.current?.contains(event.target as Node)) {
        setProductsOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProductsOpen(false);
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-50 pt-[env(safe-area-inset-top,0px)] transition-all duration-500 ${
          scrolled
            ? "border-b border-white/[0.07] bg-black/70 backdrop-blur-2xl"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="group flex items-center gap-3"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/[0.05]">
              <div className="absolute h-4 w-4 rounded-full bg-cyan-300/[0.08] blur-sm" />

              <div className="relative h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.9)]" />
            </div>

            <div>
              <p className="text-sm font-semibold tracking-[-0.02em] text-white">
                Aila
              </p>

              <p className="text-[8px] uppercase tracking-[0.3em] text-neutral-600">
                Ecosystem
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm text-neutral-500 transition duration-300 hover:bg-white/[0.04] hover:text-white"
              >
                {item.label}
              </Link>
            ))}

            <div className="relative" ref={productsRef}>
              <button
                type="button"
                aria-expanded={productsOpen}
                aria-haspopup="menu"
                aria-controls="navbar-products-menu"
                onClick={() => setProductsOpen((open) => !open)}
                className="rounded-full px-4 py-2 text-sm text-neutral-500 transition duration-300 hover:bg-white/[0.04] hover:text-white"
              >
                Products
              </button>

              {productsOpen ? (
                <div
                  id="navbar-products-menu"
                  role="menu"
                  className="absolute left-0 top-full z-50 mt-2 max-h-[70vh] w-[360px] overflow-y-auto rounded-2xl border border-white/[0.1] bg-black/95 p-2 shadow-[0_20px_80px_rgba(0,0,0,0.65)] backdrop-blur-2xl"
                >
                  {navGroups.map((group) => (
                    <div key={group.group} className="mb-1 last:mb-0">
                      <p className="px-3 pb-1 pt-2 text-[10px] uppercase tracking-[0.22em] text-neutral-600">
                        {group.label}
                      </p>
                      {group.products.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          role="menuitem"
                          onClick={() => setProductsOpen(false)}
                          className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-neutral-300 transition hover:bg-white/[0.06] hover:text-white"
                        >
                          <span>{item.name}</span>
                          <span className="text-neutral-600">→</span>
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Link
              href="/#start-project"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition duration-300 hover:scale-105"
            >
              Start a Project
            </Link>

            {isSignedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-300 transition hover:bg-white/10"
                >
                  Dashboard
                </Link>
                <Link
                  href="/billing"
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-300 transition hover:bg-white/10"
                >
                  Billing
                </Link>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "h-9 w-9",
                    },
                  }}
                />
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-300 transition hover:bg-white/10"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:scale-105"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              setMenuOpen((previous) => !previous)
            }
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={
              menuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.09] bg-white/[0.03] lg:hidden"
          >
            <div className="relative h-4 w-5">
              <span
                className={`absolute left-0 top-1 h-px w-5 bg-white transition duration-300 ${
                  menuOpen
                    ? "translate-y-[3px] rotate-45"
                    : ""
                }`}
              />

              <span
                className={`absolute bottom-1 left-0 h-px w-5 bg-white transition duration-300 ${
                  menuOpen
                    ? "-translate-y-[3px] -rotate-45"
                    : ""
                }`}
              />
            </div>
          </button>
        </div>
      </header>

      <div
        id="mobile-navigation"
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        aria-hidden={!menuOpen}
        className={`fixed inset-0 z-40 bg-[#030303] transition duration-500 lg:hidden ${
          menuOpen
            ? "pointer-events-auto visible opacity-100"
            : "pointer-events-none invisible opacity-0"
        }`}
      >
        <div className="pointer-events-none absolute left-1/2 top-[-200px] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/[0.08] blur-[140px]" />

        <div className="relative flex min-h-[100dvh] flex-col overflow-y-auto px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[calc(5.5rem+env(safe-area-inset-top,0px))] sm:px-6">
          <nav className="flex flex-col">
            {navigation.map((item, index) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="group flex items-center justify-between border-b border-white/[0.07] py-6"
              >
                <div className="flex items-center gap-5">
                  <span className="text-xs text-neutral-700">
                    0{index + 1}
                  </span>

                  <span className="text-2xl font-medium tracking-[-0.03em] text-neutral-300 transition group-hover:text-white">
                    {item.label}
                  </span>
                </div>

                <span className="text-neutral-700 transition group-hover:translate-x-1 group-hover:text-cyan-300">
                  →
                </span>
              </Link>
            ))}

            {navGroups.map((group) => (
              <div key={group.group}>
                <div className="my-4 h-px w-full bg-white/[0.06]" />
                <p className="py-3 text-xs uppercase tracking-[0.25em] text-neutral-600">
                  {group.label}
                </p>
                {group.products.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="group flex items-center justify-between border-b border-white/[0.07] py-5"
                  >
                    <span className="text-xl font-medium tracking-[-0.03em] text-neutral-300 transition group-hover:text-white">
                      {item.name}
                    </span>
                    <span className="text-neutral-700 transition group-hover:translate-x-1 group-hover:text-cyan-300">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            ))}
          </nav>

          <div className="mt-auto pt-10">
            <Link
              href="/#start-project"
              onClick={() => setMenuOpen(false)}
              className="flex w-full items-center justify-center rounded-2xl bg-white px-6 py-4 font-semibold text-black"
            >
              Start a Project
            </Link>

            <div className="mt-6 flex flex-col gap-3">
              {isSignedIn ? (
                <div className="flex flex-col items-center gap-3">
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="w-full rounded-full border border-white/10 bg-white/5 px-6 py-4 text-center text-sm font-semibold text-neutral-300"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/billing"
                    onClick={() => setMenuOpen(false)}
                    className="w-full rounded-full border border-white/10 bg-white/5 px-6 py-4 text-center text-sm font-semibold text-neutral-300"
                  >
                    Billing
                  </Link>
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "h-10 w-10",
                      },
                    }}
                  />
                </div>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    onClick={() => setMenuOpen(false)}
                    className="w-full rounded-full border border-white/10 bg-white/5 px-6 py-4 text-center text-sm font-semibold text-neutral-300 transition hover:bg-white/10"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={() => setMenuOpen(false)}
                    className="w-full rounded-full bg-white px-6 py-4 text-center text-sm font-semibold text-black transition hover:scale-105"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <p className="text-xs text-neutral-700">
                Aila Ecosystem
              </p>

              <div className="flex items-center gap-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />

                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-400" />
                </span>

                <span className="text-[9px] uppercase tracking-[0.18em] text-neutral-600">
                  Intelligence Online
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
