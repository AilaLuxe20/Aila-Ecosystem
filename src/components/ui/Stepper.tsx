"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils/cn";

import { focusRing } from "./variants";

/**
 * Progress indicators for multi-step processes.
 */

/** A step in a {@link Stepper}. */
export interface StepperStep {
  /** Stable identifier. */
  readonly id: string;
  /** Short name of the step. */
  readonly label: string;
  /** Supporting detail shown beneath the label. */
  readonly description?: string;
  /** Marks the step as unreachable. */
  readonly disabled?: boolean;
}

/** Props for {@link Stepper}. */
export interface StepperProps extends React.HTMLAttributes<HTMLElement> {
  /** The steps, in order. */
  readonly steps: readonly StepperStep[];
  /** Zero-based index of the current step. */
  readonly activeStep: number;
  /** Allows navigating to a completed step. */
  readonly onStepChange?: (index: number) => void;
  /** Layout direction. Defaults to horizontal. */
  readonly orientation?: "horizontal" | "vertical";
}

/**
 * A numbered progress indicator for a linear process.
 *
 * Only completed steps are navigable when `onStepChange` is supplied — jumping
 * forward past incomplete steps would skip validation, so it is disallowed by
 * construction rather than left to the caller.
 *
 * @param props - Steps, active index, navigation handler, and nav attributes.
 * @returns The stepper element.
 *
 * @example
 * <Stepper steps={steps} activeStep={step} onStepChange={setStep} />
 */
export function Stepper({
  steps,
  activeStep,
  onStepChange,
  orientation = "horizontal",
  className,
  ...props
}: StepperProps): React.JSX.Element {
  const isVertical = orientation === "vertical";

  return (
    <nav
      aria-label="Progress"
      className={cn("w-full", className)}
      {...props}
    >
      <ol className={cn("flex", isVertical ? "flex-col gap-0" : "items-start gap-2")}>
        {steps.map((step, index) => {
          const isComplete = index < activeStep;
          const isCurrent = index === activeStep;
          const isLast = index === steps.length - 1;
          const navigable = Boolean(onStepChange) && isComplete && !step.disabled;

          const indicator = (
            <span
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-full border text-xs font-medium",
                "transition-colors duration-normal ease-standard",
                isComplete && "border-brand-500 bg-brand-500 text-brand-950",
                isCurrent && "border-brand-500 bg-brand-500/12 text-brand-300",
                !isComplete && !isCurrent && "border-hairline-strong text-white/35",
              )}
            >
              {isComplete ? <Check aria-hidden className="size-3.5" strokeWidth={3} /> : index + 1}
            </span>
          );

          const label = (
            <span className={cn("min-w-0", isVertical ? "pb-6" : "")}>
              <span
                className={cn(
                  "block text-xs font-medium",
                  isCurrent ? "text-white" : isComplete ? "text-white/70" : "text-white/40",
                )}
              >
                {step.label}
              </span>

              {step.description ? (
                <span className="mt-0.5 block text-2xs leading-relaxed text-white/35">
                  {step.description}
                </span>
              ) : null}
            </span>
          );

          return (
            <li
              key={step.id}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "relative flex min-w-0",
                isVertical ? "gap-3" : "flex-1 flex-col items-start gap-2",
              )}
            >
              <div className={cn("flex items-center gap-3", isVertical ? "" : "w-full")}>
                {navigable ? (
                  <button
                    type="button"
                    onClick={() => onStepChange?.(index)}
                    aria-label={`Return to ${step.label}`}
                    className={cn("rounded-full", focusRing)}
                  >
                    {indicator}
                  </button>
                ) : (
                  indicator
                )}

                {!isVertical && !isLast ? (
                  <span
                    aria-hidden
                    className={cn(
                      "h-px flex-1 transition-colors duration-normal",
                      isComplete ? "bg-brand-500" : "bg-hairline",
                    )}
                  />
                ) : null}
              </div>

              {isVertical && !isLast ? (
                <span
                  aria-hidden
                  className={cn(
                    "absolute start-[0.84rem] top-8 bottom-0 w-px transition-colors duration-normal",
                    isComplete ? "bg-brand-500" : "bg-hairline",
                  )}
                />
              ) : null}

              {label}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** An entry in a {@link Timeline}. */
export interface TimelineEntry {
  readonly id: string;
  /** Headline describing what happened. */
  readonly title: string;
  /** Supporting detail. */
  readonly description?: React.ReactNode;
  /** Pre-formatted timestamp. */
  readonly timestamp?: string;
  /** Icon rendered in the node. Defaults to a dot. */
  readonly icon?: React.ReactNode;
  /** Accent colour of the node. */
  readonly tone?: "neutral" | "brand" | "success" | "warning" | "danger";
}

/** Props for {@link Timeline}. */
export interface TimelineProps extends React.HTMLAttributes<HTMLOListElement> {
  /** Entries, ordered newest or oldest first as the caller prefers. */
  readonly entries: readonly TimelineEntry[];
}

const NODE_TONES: Record<NonNullable<TimelineEntry["tone"]>, string> = {
  neutral: "border-hairline-strong bg-surface-raised text-white/45",
  brand: "border-brand-500/40 bg-brand-500/12 text-brand-300",
  success: "border-success/40 bg-success/12 text-success",
  warning: "border-warning/40 bg-warning/12 text-warning",
  danger: "border-danger/40 bg-danger/12 text-danger",
};

/**
 * A vertical sequence of events.
 *
 * Rendered as an ordered list, so the sequence is conveyed structurally rather
 * than only by the connecting line.
 *
 * @param props - Entries and list attributes.
 * @returns The timeline element.
 */
export function Timeline({ entries, className, ...props }: TimelineProps): React.JSX.Element {
  return (
    <ol className={cn("relative", className)} {...props}>
      {entries.map((entry, index) => {
        const isLast = index === entries.length - 1;

        return (
          <li key={entry.id} className="relative flex gap-3 pb-6 last:pb-0">
            {!isLast ? (
              <span
                aria-hidden
                className="absolute start-[0.6875rem] top-7 bottom-0 w-px bg-hairline"
              />
            ) : null}

            <span
              aria-hidden
              className={cn(
                "z-10 grid size-6 shrink-0 place-items-center rounded-full border [&_svg]:size-3",
                NODE_TONES[entry.tone ?? "neutral"],
              )}
            >
              {entry.icon ?? <span className="size-1.5 rounded-full bg-current" />}
            </span>

            <div className="min-w-0 flex-1 -mt-0.5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-medium text-white">{entry.title}</p>
                {entry.timestamp ? (
                  <time className="shrink-0 text-2xs text-white/35">{entry.timestamp}</time>
                ) : null}
              </div>

              {entry.description ? (
                <div className="mt-1 text-xs leading-relaxed text-white/55">
                  {entry.description}
                </div>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
