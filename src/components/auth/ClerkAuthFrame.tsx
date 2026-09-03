"use client";

import { ClerkFailed, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import type { ReactNode } from "react";

type ClerkAuthFrameProps = {
  title: string;
  description: string;
  loadingLabel: string;
  children: ReactNode;
};

export function ClerkAuthFrame({
  title,
  description,
  loadingLabel,
  children,
}: ClerkAuthFrameProps) {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#030303] px-4 py-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="w-full max-w-[420px]">
        <p className="text-center text-xs uppercase tracking-[0.28em] text-neutral-500">
          Aila Ecosystem
        </p>
        <h1 className="mt-3 text-center text-3xl font-semibold tracking-[-0.04em] text-white">
          {title}
        </h1>
        <p className="mt-2 text-center text-sm leading-6 text-neutral-400">{description}</p>

        <div className="mt-8 flex min-h-[28rem] items-start justify-center">
          <ClerkFailed>
            <div className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-8 text-center">
              <p className="text-sm font-medium text-white">Authentication could not start</p>
              <p className="mt-2 text-sm leading-6 text-neutral-400">
                Refresh this page. If it stays blank, your connection to Aila authentication is
                blocked.
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-black"
              >
                Try again
              </button>
            </div>
          </ClerkFailed>
          <ClerkLoading>
            <div className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-16 text-center text-sm text-neutral-400">
              {loadingLabel}
            </div>
          </ClerkLoading>
          <ClerkLoaded>{children}</ClerkLoaded>
        </div>
      </div>
    </div>
  );
}
