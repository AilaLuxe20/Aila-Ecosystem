import Link from "next/link";

const productLinks = [
  {
    label: "Aila Intelligence",
    href: "/products/intelligence",
  },
  {
    label: "AilaLegal AI",
    href: "/products/ailalegal",
  },
  {
    label: "Aila Business AI",
    href: "/products/business",
  },
  {
    label: "Aila Automation",
    href: "/products/automation",
  },
];

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
    label: "Start a Project",
    href: "/#start-project",
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.07] bg-[#030303]">
      <div className="pointer-events-none absolute bottom-[-300px] left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-cyan-500/[0.06] blur-[160px]" />

      <div className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-16 lg:grid-cols-[1.5fr_1fr_1fr]">
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

            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-4 py-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />

                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-400" />
              </span>

              <span className="text-[9px] uppercase tracking-[0.18em] text-neutral-600">
                Aila Intelligence Online
              </span>
            </div>
          </div>

          {/* PRODUCTS */}
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-neutral-700">
              Products
            </p>

            <div className="mt-6 flex flex-col gap-4">
              {productLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="w-fit text-sm text-neutral-500 transition hover:translate-x-1 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* COMPANY */}
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-neutral-700">
              Explore
            </p>

            <div className="mt-6 flex flex-col gap-4">
              {companyLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
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