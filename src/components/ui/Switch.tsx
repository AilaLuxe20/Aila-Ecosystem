"use client";

import { Switch as SwitchPrimitive } from "radix-ui";
import { forwardRef } from "react";

import { cn } from "@/lib/utils/cn";

import { useFieldControl } from "./Field";
import { disabledStyles, focusRing } from "./variants";

/** Size of a switch track. */
export type SwitchSize = "sm" | "md";

const TRACK_SIZES: Record<SwitchSize, string> = {
  sm: "h-4 w-7",
  md: "h-5 w-9",
};

const THUMB_SIZES: Record<SwitchSize, string> = {
  sm: "size-3 data-[state=checked]:translate-x-3",
  md: "size-4 data-[state=checked]:translate-x-4",
};

/** Props for {@link Switch}. */
export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  /** Text rendered beside the switch. */
  readonly label?: React.ReactNode;
  /** Helper text rendered beneath the label. */
  readonly description?: React.ReactNode;
  /** Track size. Defaults to `"md"`. */
  readonly size?: SwitchSize;
  /** Places the label before the switch, filling the available width. */
  readonly labelPosition?: "start" | "end";
}

/**
 * An immediate on/off toggle.
 *
 * Use a switch when the change takes effect at once, and a {@link Checkbox}
 * when it is staged until a form is submitted — that distinction is what tells
 * a user whether they still need to press Save.
 *
 * @param props - Label, description, size, and switch attributes.
 * @returns The switch control.
 *
 * @example
 * <Switch label="Email notifications" checked={enabled} onCheckedChange={setEnabled} />
 */
export const Switch = forwardRef<React.ComponentRef<typeof SwitchPrimitive.Root>, SwitchProps>(
  function Switch(
    { className, label, description, size = "md", labelPosition = "end", disabled, id, ...props },
    ref,
  ) {
    const field = useFieldControl({ disabled, id });

    const control = (
      <SwitchPrimitive.Root
        ref={ref}
        id={field.id}
        disabled={field.disabled}
        aria-describedby={field["aria-describedby"]}
        className={cn(
          "relative inline-flex shrink-0 items-center rounded-full border border-transparent",
          "bg-white/15 transition-colors duration-normal ease-standard",
          "data-[state=checked]:bg-brand-500",
          TRACK_SIZES[size],
          focusRing,
          disabledStyles,
          className,
        )}
        {...props}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            "pointer-events-none block translate-x-0.5 rounded-full bg-white shadow-elevation-1",
            "transition-transform duration-normal ease-emphasized",
            THUMB_SIZES[size],
          )}
        />
      </SwitchPrimitive.Root>
    );

    if (!label && !description) return control;

    const text = (
      <span className="grid gap-0.5">
        {label ? (
          <label
            htmlFor={field.id}
            className={cn(
              "cursor-pointer text-sm leading-tight text-white/85 select-none",
              field.disabled && "cursor-not-allowed opacity-50",
            )}
          >
            {label}
          </label>
        ) : null}

        {description ? <span className="text-xs text-white/45">{description}</span> : null}
      </span>
    );

    return (
      <div
        className={cn(
          "flex items-start gap-3",
          labelPosition === "start" && "w-full justify-between",
        )}
      >
        {labelPosition === "start" ? (
          <>
            {text}
            {control}
          </>
        ) : (
          <>
            <span className="mt-0.5">{control}</span>
            {text}
          </>
        )}
      </div>
    );
  },
);
