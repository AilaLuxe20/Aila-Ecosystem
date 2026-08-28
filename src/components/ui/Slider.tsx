"use client";

import { Slider as SliderPrimitive } from "radix-ui";
import { forwardRef, useMemo } from "react";

import { cn } from "@/lib/utils/cn";

import { useFieldControl } from "./Field";
import { disabledStyles, focusRing } from "./variants";

/** Props for {@link Slider}. */
export interface SliderProps
  extends Omit<React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>, "asChild"> {
  /** Renders the current value beside the track. */
  readonly showValue?: boolean;
  /** Formats the displayed value and the thumb's accessible label. */
  readonly formatValue?: (value: number) => string;
  /** Renders tick marks at each step. Suppressed above 20 steps. */
  readonly showTicks?: boolean;
}

/**
 * A range input supporting single and multiple thumbs.
 *
 * Passing an array of two values produces a range selector; Radix handles thumb
 * collision, keyboard stepping, and RTL direction.
 *
 * `formatValue` also feeds `aria-valuetext`, so a screen reader announces
 * "40 percent" rather than a bare "40".
 *
 * @param props - Value display, tick marks, and slider attributes.
 * @returns The slider control.
 *
 * @example
 * <Slider min={0} max={100} step={5} showValue formatValue={(v) => `${v}%`} />
 */
export const Slider = forwardRef<React.ComponentRef<typeof SliderPrimitive.Root>, SliderProps>(
  function Slider(
    {
      className,
      showValue = false,
      showTicks = false,
      formatValue,
      min = 0,
      max = 100,
      step = 1,
      value,
      defaultValue,
      disabled,
      ...props
    },
    ref,
  ) {
    const field = useFieldControl({ disabled });
    const current = value ?? defaultValue ?? [min];

    const ticks = useMemo(() => {
      if (!showTicks || step <= 0) return [];

      const count = Math.floor((max - min) / step);
      // Beyond ~20 ticks the marks merge into a solid line and stop being
      // legible, so they are dropped rather than rendered as noise.
      if (count > 20) return [];

      return Array.from({ length: count + 1 }, (_, index) => min + index * step);
    }, [showTicks, min, max, step]);

    const format = formatValue ?? ((input: number) => String(input));

    return (
      <div className="w-full space-y-2">
        {showValue ? (
          <div className="flex justify-between text-xs text-white/55">
            <span>{format(min)}</span>
            <span className="font-medium text-white">
              {current.map((entry) => format(entry)).join(" – ")}
            </span>
            <span>{format(max)}</span>
          </div>
        ) : null}

        <SliderPrimitive.Root
          ref={ref}
          min={min}
          max={max}
          step={step}
          value={value}
          defaultValue={defaultValue}
          disabled={field.disabled}
          className={cn(
            "relative flex w-full touch-none items-center select-none",
            "data-[orientation=vertical]:h-40 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
            disabledStyles,
            className,
          )}
          {...props}
        >
          <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-white/12 data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1">
            <SliderPrimitive.Range className="absolute h-full rounded-full bg-brand-500 data-[orientation=vertical]:w-full" />
          </SliderPrimitive.Track>

          {ticks.length > 0 ? (
            <div aria-hidden className="pointer-events-none absolute inset-x-0 flex justify-between">
              {ticks.map((tick) => (
                <span key={tick} className="size-0.5 rounded-full bg-white/25" />
              ))}
            </div>
          ) : null}

          {current.map((entry, index) => (
            <SliderPrimitive.Thumb
              key={index}
              aria-valuetext={format(entry)}
              className={cn(
                "block size-4 rounded-full border-2 border-brand-500 bg-canvas shadow-elevation-2",
                "transition-transform duration-fast ease-standard hover:scale-110",
                focusRing,
              )}
            />
          ))}
        </SliderPrimitive.Root>
      </div>
    );
  },
);
