"use client";

import { AlertCircle, Inbox, RefreshCw } from "lucide-react";
import { forwardRef } from "react";

import { cn } from "@/lib/utils/cn";
import { formatErrorForUser } from "@/lib/errors/formatter";

import { Button } from "./Button";
import { Spinner } from "./Spinner";

/**
 * Full-region state displays.
 *
 * Every asynchronous surface resolves to exactly one of empty, error, or
 * loading. Providing all three as components keeps that vocabulary consistent
 * instead of each screen inventing its own placeholder.
 */

/** Props for {@link EmptyState}. */
export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Headline explaining what is absent. */
  readonly title: string;
  /** Sentence telling the user what to do next. */
  readonly description?: string;
  /** Illustration or icon. Defaults to an inbox glyph. */
  readonly icon?: React.ReactNode;
  /** Primary action, typically the one that creates the first item. */
  readonly action?: React.ReactNode;
  /** Reduces padding for use inside a card or panel. */
  readonly compact?: boolean;
}

/**
 * Shown when a collection has no items.
 *
 * A good empty state names the action that fills it, which is why `action` sits
 * alongside the description rather than being optional decoration.
 *
 * @param props - Title, description, icon, action, and div attributes.
 * @returns The empty state element.
 */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  { title, description, icon, action, compact = false, className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "gap-2 px-4 py-8" : "gap-3 px-6 py-16",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className="grid size-11 place-items-center rounded-full bg-surface-raised text-white/35 [&_svg]:size-5"
      >
        {icon ?? <Inbox />}
      </span>

      <div className="space-y-1">
        <p className="text-sm font-medium text-white">{title}</p>
        {description ? (
          <p className="mx-auto max-w-sm text-xs leading-relaxed text-white/50">{description}</p>
        ) : null}
      </div>

      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
});

/** Props for {@link ErrorState}. */
export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The caught value. Formatted through the platform error formatter. */
  readonly error: unknown;
  /** Overrides the derived title. */
  readonly title?: string;
  /** Overrides the derived description. */
  readonly description?: string;
  /** Retries the failed operation. A retry control appears when supplied. */
  readonly onRetry?: () => void;
  /** Reduces padding for use inside a card or panel. */
  readonly compact?: boolean;
}

/**
 * Shown when an operation fails.
 *
 * The title, description, and whether a retry is even worth offering all come
 * from {@link formatErrorForUser}, so a validation failure does not get a
 * pointless "Try again" button while a network blip does.
 *
 * @param props - The error, overrides, retry handler, and div attributes.
 * @returns The error state element.
 */
export const ErrorState = forwardRef<HTMLDivElement, ErrorStateProps>(function ErrorState(
  { error, title, description, onRetry, compact = false, className, ...props },
  ref,
) {
  const formatted = formatErrorForUser(error);

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "gap-2 px-4 py-8" : "gap-3 px-6 py-16",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className="grid size-11 place-items-center rounded-full bg-danger/12 text-danger [&_svg]:size-5"
      >
        <AlertCircle />
      </span>

      <div className="space-y-1">
        <p className="text-sm font-medium text-white">{title ?? formatted.title}</p>
        <p className="mx-auto max-w-sm text-xs leading-relaxed text-white/50">
          {description ?? formatted.description}
        </p>
      </div>

      {onRetry && formatted.retryable ? (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          leadingIcon={<RefreshCw />}
          className="mt-1"
        >
          Try again
        </Button>
      ) : null}

      <p className="text-2xs text-white/25">Reference: {formatted.code}</p>
    </div>
  );
});

/** Props for {@link LoadingState}. */
export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Message announced and displayed while loading. */
  readonly label?: string;
  /** Reduces padding for use inside a card or panel. */
  readonly compact?: boolean;
}

/**
 * Shown while a region is loading and no skeleton is appropriate.
 *
 * Prefer a {@link Skeleton} when the eventual shape is known — it communicates
 * more and reduces the perceived wait. Use this when it is not.
 *
 * @param props - Label and div attributes.
 * @returns The loading state element.
 */
export const LoadingState = forwardRef<HTMLDivElement, LoadingStateProps>(function LoadingState(
  { label = "Loading", compact = false, className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        compact ? "px-4 py-8" : "px-6 py-16",
        className,
      )}
      {...props}
    >
      <Spinner size="lg" label="" className="text-brand-400" />
      <p className="text-xs text-white/50">{label}</p>
    </div>
  );
});
