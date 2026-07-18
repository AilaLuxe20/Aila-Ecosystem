"use client";

import Link from "next/link";
import { useAilaLegal } from "@/app/components/AilaLegalContext";

export default function TopBar() {
  const { hasDocument, documentContext, clearDocument } = useAilaLegal();

  return (
    <header className="flex items-center justify-between gap-4 border-b border-white/[0.07] bg-[#030303]/80 px-6 py-4 backdrop-blur-2xl">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-3 transition opacity-80 hover:opacity-100"
        >
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/[0.05]">
            <div className="absolute h-4 w-4 rounded-full bg-cyan-300/[0.08] blur-sm" />
            <div className="relative h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.9)]" />
          </div>

          <span className="text-xs font-medium text-neutral-500 transition hover:text-white">
            Aila
          </span>
        </Link>

        <span className="text-neutral-700">/</span>

        <div className="flex items-center gap-2">
          <div className="relative flex h-6 w-6 items-center justify-center rounded-lg border border-violet-400/15 bg-violet-400/[0.05]">
            <div className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.8)]" />
          </div>

          <span className="text-sm font-medium text-white">
            AilaLegal
          </span>

          <span className="rounded-full border border-violet-400/15 bg-violet-400/[0.06] px-2 py-0.5 text-[10px] uppercase tracking-widest text-violet-300">
            AI
          </span>
        </div>
      </div>

      {hasDocument && documentContext && (
        <div className="hidden items-center gap-2 rounded-full border border-violet-400/15 bg-violet-400/[0.05] px-4 py-2 sm:flex">
          <svg
            className="h-3 w-3 shrink-0 text-violet-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>

          <span className="max-w-[180px] truncate text-xs text-violet-200">
            {documentContext.fileName}
          </span>

          <button
            type="button"
            onClick={clearDocument}
            className="ml-1 text-neutral-700 transition hover:text-red-400"
            title="Remove document"
          >
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-full border border-green-400/10 bg-green-400/[0.04] px-3 py-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-400" />
          </span>
          <span className="hidden text-[9px] uppercase tracking-[0.18em] text-green-300/60 sm:block">
            Online
          </span>
        </div>

        <Link
          href="/"
          className="hidden rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs text-neutral-500 transition hover:border-white/[0.15] hover:text-white sm:block"
        >
          ← Ecosystem
        </Link>
      </div>
    </header>
  );
}