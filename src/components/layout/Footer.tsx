"use client";

import Link from "next/link";
import { track } from "@vercel/analytics";
import { ALL_PRODUCTS } from "@/core/constants";

const aiProducts = ALL_PRODUCTS.slice(0, 4);
const platformProducts = ALL_PRODUCTS.slice(4);

const companyLinks = [
  {
    label: "Services",
    href: "/#services",
  },
  {
    label: "Products",
    href: "/#products",
  },
  {
    label: "Build With Aila",
    href: "/build-with-aila",
  },
  {
    label: "Project Discovery",
    href: "/project-discovery",
  },
  {
    label: "Start a Project",
    href: "/#start-project",
  },
];

const socialLinks = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/adachukwu-favour-ba7483414",
  },
  {
    label: "Fiverr",
    href: "https://www.fiverr.com/s/38B4XjB",
  },
  {
    label: "X",
    href: "https://x.com/ailaluxe?s=11",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/ailaluxeventures?igsh=MXh5OW91cDk4d2lqbg==",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@ailaluxeventures?_r=1&_t=ZS-97t4y3OvRgb",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/1BZiH6gAV7/?mibextid=wwXIfr",
  },
];

export default function Footer() {
  function trackClick(eventName: string, destination: string) {
    track(eventName, {
      destination,
      location: "footer",
    });
  }

  return (
    <footer className="relative overflow-hidden border-t border-white/[0.07] bg-[#030303]">
      <div className="pointer-events-none absolute bottom-[-300px] left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-cyan-500/[0.06] blur-[160px]" />

      <div className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-16 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* BRAND */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-3"
            >
              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.05]">
                <div className="absolute h-5 w-5 rounded-full bg-cyan-300/[0.08] blur-md" />

                <div className="relative h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_20px_rgba(103,232,249,0.9)]" />
              </div>

              <div>
                <p className="text-lg font-semibold tracking-[-0.03em]">
                  Aila
                </p>

                <p className="text-[9px] uppercase tracking-[0.32em] text-neutral-600">
                  Ecosystem
                </p>
              </div>
            </Link>

            <p className="mt-7 max-w-md text-sm leading-7 text-neutral-500">
              An intelligent software ecosystem building
              AI-powered products, websites, applications
              and automation systems for what comes next.
            </p>

            <a
              href="https://wa.me/2348080479490"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with Aila Ecosystem on WhatsApp"
              onClick={() =>
                trackClick("whatsapp_clicked", "WhatsApp")
              }
              className="mt-7 inline-flex items-center gap-3 rounded-full border border-green-400/20 bg-green-400/[0.06] px-5 py-3 text-sm font-medium text-green-300 transition duration-300 hover:-translate-y-0.5 hover:border-green-400/40 hover:bg-green-400/[0.1]"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />

                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
              </span>

              Chat on WhatsApp
            </a>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-4 py-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />

                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-400" />
              </span>

              <span className="text-[9px] uppercase tracking-[0.18em] text-neutral-600">
                Aila Intelligence Online
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit Aila Ecosystem on ${item.label}`}
                  onClick={() =>
                    trackClick("social_link_clicked", item.label)
                  }
                  className="text-xs text-neutral-600 transition hover:text-white"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          {/* AI PRODUCTS */}
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-neutral-700">
              AI Products
            </p>

            <div className="mt-6 flex flex-col gap-4">
              {aiProducts.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() =>
                    trackClick("product_clicked", item.name)
                  }
                  className="w-fit text-sm text-neutral-500 transition hover:translate-x-1 hover:text-white"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* PLATFORM */}
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-neutral-700">
              Platform
            </p>

            <div className="mt-6 flex flex-col gap-4">
              {platformProducts.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() =>
                    trackClick("product_clicked", item.name)
                  }
                  className="w-fit text-sm text-neutral-500 transition hover:translate-x-1 hover:text-white"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* EXPLORE */}
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-neutral-700">
              Explore
            </p>

            <div className="mt-6 flex flex-col gap-4">
              {companyLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() =>
                    trackClick("navigation_clicked", item.label)
                  }
                  className="w-fit text-sm text-neutral-500 transition hover:translate-x-1 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-5 border-t border-white/[0.07] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-neutral-700">
            © {new Date().getFullYear()} Aila Ecosystem.
            All rights reserved.
          </p>

          <p className="text-xs text-neutral-700">
            Intelligence for what comes next.
          </p>
        </div>
      </div>
    </footer>
  );
}
