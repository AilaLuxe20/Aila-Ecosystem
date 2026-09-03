import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Offline",
  description: "Aila is unavailable without a network connection.",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#030303] px-6 py-16 text-center text-white">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06]">
        <div className="h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.9)]" />
      </div>
      <p className="text-xs uppercase tracking-[0.28em] text-neutral-600">Aila Ecosystem</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">You&apos;re offline</h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-neutral-400">
        Aila needs a network connection for sign-in, Writer, uploads, and AI generation. Reconnect,
        then continue where you left off — your account and data are unchanged.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-black"
      >
        Try again
      </Link>
    </main>
  );
}
