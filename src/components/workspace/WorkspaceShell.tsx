"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import type { ReactNode } from "react";

import {
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui";
import { cn } from "@/lib/utils/cn";

export type WorkspaceAccent =
  | "cyan"
  | "purple"
  | "violet"
  | "emerald"
  | "amber"
  | "indigo"
  | "teal"
  | "fuchsia"
  | "rose"
  | "sky"
  | "lime"
  | "orange"
  | "blue";

const ACCENT: Record<WorkspaceAccent, { glow: string; kicker: string }> = {
  cyan: { glow: "bg-cyan-500/[0.1]", kicker: "text-cyan-200/70" },
  purple: { glow: "bg-purple-500/[0.1]", kicker: "text-purple-200/70" },
  violet: { glow: "bg-violet-500/[0.1]", kicker: "text-violet-200/70" },
  emerald: { glow: "bg-emerald-500/[0.1]", kicker: "text-emerald-200/70" },
  amber: { glow: "bg-amber-500/[0.1]", kicker: "text-amber-200/70" },
  indigo: { glow: "bg-indigo-500/[0.1]", kicker: "text-indigo-200/70" },
  teal: { glow: "bg-teal-500/[0.1]", kicker: "text-teal-200/70" },
  fuchsia: { glow: "bg-fuchsia-500/[0.1]", kicker: "text-fuchsia-200/70" },
  rose: { glow: "bg-rose-500/[0.1]", kicker: "text-rose-200/70" },
  sky: { glow: "bg-sky-500/[0.1]", kicker: "text-sky-200/70" },
  lime: { glow: "bg-lime-500/[0.1]", kicker: "text-lime-200/70" },
  orange: { glow: "bg-orange-500/[0.1]", kicker: "text-orange-200/70" },
  blue: { glow: "bg-blue-500/[0.1]", kicker: "text-blue-200/70" },
};

type WorkspaceShellProps = {
  product: string;
  href: string;
  accent: WorkspaceAccent;
  title: string;
  description: string;
  actions?: ReactNode;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  children: ReactNode;
};

function WorkspaceShellInner({
  product,
  href,
  accent,
  title,
  description,
  actions,
  loading,
  error,
  onRetry,
  children,
}: WorkspaceShellProps): React.JSX.Element {
  const { isLoaded, isSignedIn } = useAuth();
  const tones = ACCENT[accent];

  return (
    <main className="relative min-h-[100dvh] overflow-x-clip overflow-y-visible bg-[#030303] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div
        className={cn(
          "pointer-events-none absolute left-1/2 top-[-280px] h-[640px] w-[900px] -translate-x-1/2 rounded-full blur-[180px]",
          tones.glow,
        )}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className={cn("text-xs uppercase tracking-[0.24em]", tones.kicker)}>
              Aila Ecosystem / {product}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl lg:text-5xl">{title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">{description}</p>
          </div>
          {isSignedIn ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </header>

        {!isLoaded ? (
          <LoadingState label={`Loading ${product}`} className="mt-16" />
        ) : !isSignedIn ? (
          <EmptyState
            className="mt-16"
            title={`Sign in to use Aila ${product}`}
            description="Your work is private and stored against your account. Sign in to create, edit, and run it."
            action={
              <Button asChild>
                <Link href={`/sign-in?redirect_url=${encodeURIComponent(href)}`}>
                  Sign in
                </Link>
              </Button>
            }
          />
        ) : error ? (
          <ErrorState className="mt-16" error={error} onRetry={onRetry} />
        ) : loading ? (
          <LoadingState label={`Loading ${product}`} className="mt-16" />
        ) : (
          <div className="mt-8">{children}</div>
        )}
      </div>
    </main>
  );
}

export function WorkspaceShell(props: WorkspaceShellProps): React.JSX.Element {
  return <WorkspaceShellInner {...props} />;
}
