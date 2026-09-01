import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center bg-[#030303] px-6 text-center text-white">
      <p className="text-xs uppercase tracking-[0.28em] text-neutral-600">404</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
        This page does not exist.
      </h1>
      <p className="mt-4 max-w-md text-sm leading-7 text-neutral-500">
        The address may be outdated, or the product is not part of this Aila
        deployment.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black"
        >
          Back to Aila
        </Link>
        <Link
          href="/#products"
          className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm text-neutral-300"
        >
          View products
        </Link>
      </div>
    </main>
  );
}
