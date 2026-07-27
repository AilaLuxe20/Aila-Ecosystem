"use client";

import { Progress as ProgressPrimitive } from "radix-ui";
import { forwardRef } from "react";

import { cn } from "@/lib/utils/cn";
import { clamp, percentage } from "@/lib/utils/number";

import { toneSolidStyles, type Tone } from "./variants";

/** Height of a progress track. */
export type ProgressSize = "sm" | "md" | "lg";

const TRACK_HEIGHTS: Record<ProgressSize, string> = {
  sm: "h-1",
  md: "h-1.5",
  lg: "h-2.5",
};

/** Props for {@link Progress}. */
export interface ProgressProps
  extends Omit<React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>, "value"> {
  /** Completion amount. Pass `null` for an indeterminate bar. */
  readonly value: number | null;
  /** Value representing completion. Defaults to 100. */
  readonly max?: number;
  /** Track height. Defaults to `"md"`. */
  readonly size?: ProgressSize;
  /** Fill colour. Defaults to `"brand"`. */
  readonly tone?: Tone;
  /** Renders the percentage beside the track. */
  readonly showValue?: boolean;
  /** Describes what is progressing, for assistive technology. */
  readonly label?: string;
}

/**
 * A horizontal progress bar.
 *
 * Passing `null` produces an indeterminate bar for work whose duration is not
 * known — an honest indeterminate animation is better than a fabricated
 * percentage that stalls at 90%.
 *
 * @param props - Value, tone, size, and progress attributes.
 * @returns The progress bar.
 *
 * @example
 * <Progress value={uploaded} max={total} showValue label="Uploading" />
 */
export const Progress = forwardRef<
  React.ComponentRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(function Progress(
  { className, value, max = 100, size = "md", tone = "brand", showValue = false, label, ...props },
  ref,
) {
  const isIndeterminate = value === null;
  const percent = isIndeterminate ? 0 : percentage(clamp(value, 0, max), max);

  return (
    <div className="flex w-full items-center gap-3">
      <ProgressPrimitive.Root
        ref={ref}
        value={isIndeterminate ? null : value}
        max={max}
        aria-label={label}
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-white/10",
          TRACK_HEIGHTS[size],
          className,
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "size-full rounded-full transition-transform duration-slow ease-standard",
            toneSolidStyles[tone],
            isIndeterminate && "animate-indeterminate",
          )}
          style={
            isIndeterminate ? undefined : { transform: `translateX(-${100 - percent}%)` }
          }
        />
      </ProgressPrimitive.Root>

      {showValue && !isIndeterminate ? (
        <span className="shrink-0 text-xs tabular-nums text-white/60">
          {Math.round(percent)}%
        </span>
      ) : null}
    </div>
  );
});

/** Props for {@link CircularProgress}. */
export interface CircularProgressProps extends React.SVGAttributes<SVGSVGElement> {
  /** Completion amount. Pass `null` for an indeterminate ring. */
  readonly value: number | null;
  /** Value representing completion. Defaults to 100. */
  readonly max?: number;
  /** Diameter in pixels. Defaults to 40. */
  readonly diameter?: number;
  /** Stroke width in pixels. Defaults to 4. */
  readonly thickness?: number;
  /** Stroke colour. Defaults to `"brand"`. */
  readonly tone?: Tone;
  /** Renders the percentage in the centre. */
  readonly showValue?: boolean;
  /** Describes what is progressing, for assistive technology. */
  readonly label?: string;
}

/** Stroke colour per tone. */
const TONE_STROKE: Record<Tone, string> = {
  neutral: "stroke-white/70",
  brand: "stroke-brand-500",
  success: "stroke-success",
  warning: "stroke-warning",
  danger: "stroke-danger",
  info: "stroke-info",
};

/**
 * A circular progress indicator.
 *
 * Drawn with `stroke-dasharray` on a single circle, so the ring scales cleanly
 * at any diameter without bitmap artefacts.
 *
 * @param props - Value, diameter, thickness, tone, and SVG attributes.
 * @returns The circular progress element.
 */
export const CircularProgress = forwardRef<SVGSVGElement, CircularProgressProps>(
  function CircularProgress(
    {
      value,
      max = 100,
      diameter = 40,
      thickness = 4,
      tone = "brand",
      showValue = false,
      label,
      className,
      ...props
    },
    ref,
  ) {
    const isIndeterminate = value === null;
    const percent = isIndeterminate ? 25 : percentage(clamp(value, 0, max), max);

    const radius = (diameter - thickness) / 2;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - percent / 100);

    return (
      <div
        className="relative inline-grid place-items-center"
        style={{ width: diameter, height: diameter }}
      >
        <svg
          ref={ref}
          width={diameter}
          height={diameter}
          viewBox={`0 0 ${diameter} ${diameter}`}
          role="progressbar"
          aria-label={label}
          aria-valuenow={isIndeterminate ? undefined : Math.round(percent)}
          aria-valuemin={0}
          aria-valuemax={100}
          className={cn("-rotate-90", isIndeterminate && "animate-spin", className)}
          {...props}
        >
          <circle
            cx={diameter / 2}
            cy={diameter / 2}
            r={radius}
            fill="none"
            strokeWidth={thickness}
            className="stroke-white/10"
          />
          <circle
            cx={diameter / 2}
            cy={diameter / 2}
            r={radius}
            fill="none"
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className={cn(
              TONE_STROKE[tone],
              !isIndeterminate && "transition-[stroke-dashoffset] duration-slow ease-standard",
            )}
          />
        </svg>

        {showValue && !isIndeterminate ? (
          <span className="absolute text-2xs font-medium tabular-nums text-white">
            {Math.round(percent)}
          </span>
        ) : null}
      </div>
    );
  },
);
