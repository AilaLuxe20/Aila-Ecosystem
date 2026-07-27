"use client";

import { Check, Minus } from "lucide-react";
import { Checkbox as CheckboxPrimitive, RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { forwardRef } from "react";

import { cn } from "@/lib/utils/cn";

import { useFieldControl } from "./Field";
import { disabledStyles, focusRing } from "./variants";

/** Props for {@link Checkbox}. */
export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  /** Text rendered beside the box and wired as the accessible name. */
  readonly label?: React.ReactNode;
  /** Helper text rendered beneath the label. */
  readonly description?: React.ReactNode;
}

/**
 * A checkbox supporting checked, unchecked, and indeterminate states.
 *
 * Indeterminate is a real tri-state value (`"indeterminate"`), not a visual
 * hack — assistive technology reports it as "mixed", which is what a partially
 * selected parent row in a table needs.
 *
 * @param props - Label, description, and checkbox attributes.
 * @returns The checkbox control.
 *
 * @example
 * <Checkbox checked={allSelected ? true : someSelected ? "indeterminate" : false} />
 */
export const Checkbox = forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(function Checkbox({ className, label, description, disabled, id, ...props }, ref) {
  const field = useFieldControl({ disabled, id });

  const box = (
    <CheckboxPrimitive.Root
      ref={ref}
      id={field.id}
      disabled={field.disabled}
      aria-describedby={field["aria-describedby"]}
      className={cn(
        "peer grid size-4 shrink-0 place-items-center rounded-[0.25rem] border border-hairline-strong",
        "bg-surface-sunken transition-colors duration-fast ease-standard",
        "data-[state=checked]:border-brand-500 data-[state=checked]:bg-brand-500",
        "data-[state=indeterminate]:border-brand-500 data-[state=indeterminate]:bg-brand-500",
        focusRing,
        disabledStyles,
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="text-brand-950">
        {props.checked === "indeterminate" ? (
          <Minus aria-hidden className="size-3" strokeWidth={3} />
        ) : (
          <Check aria-hidden className="size-3" strokeWidth={3} />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );

  if (!label && !description) return box;

  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5">{box}</span>

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
    </div>
  );
});

/** Props for {@link RadioGroup}. */
export interface RadioGroupProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  /** Lays the options out horizontally. */
  readonly orientation?: "horizontal" | "vertical";
}

/**
 * A group of mutually exclusive options.
 *
 * Radix implements roving tabindex here, so the group is a single tab stop and
 * arrow keys move between options — the behaviour a radio group is expected to
 * have and the reason not to hand-roll one.
 *
 * @param props - Orientation and radio group attributes.
 * @returns The radio group container.
 */
export const RadioGroup = forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(function RadioGroup({ className, orientation = "vertical", ...props }, ref) {
  return (
    <RadioGroupPrimitive.Root
      ref={ref}
      orientation={orientation}
      className={cn(
        "flex gap-3",
        orientation === "vertical" ? "flex-col" : "flex-row flex-wrap items-center",
        className,
      )}
      {...props}
    />
  );
});

/** Props for {@link Radio}. */
export interface RadioProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  /** Text rendered beside the control. */
  readonly label?: React.ReactNode;
  /** Helper text rendered beneath the label. */
  readonly description?: React.ReactNode;
}

/**
 * A single option within a {@link RadioGroup}.
 *
 * @param props - Label, description, and radio item attributes.
 * @returns The radio option.
 */
export const Radio = forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Item>,
  RadioProps
>(function Radio({ className, label, description, id, value, ...props }, ref) {
  const controlId = id ?? `radio-${value}`;

  const control = (
    <RadioGroupPrimitive.Item
      ref={ref}
      id={controlId}
      value={value}
      className={cn(
        "grid size-4 shrink-0 place-items-center rounded-full border border-hairline-strong",
        "bg-surface-sunken transition-colors duration-fast ease-standard",
        "data-[state=checked]:border-brand-500",
        focusRing,
        disabledStyles,
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="size-2 rounded-full bg-brand-500" />
    </RadioGroupPrimitive.Item>
  );

  if (!label && !description) return control;

  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5">{control}</span>

      <span className="grid gap-0.5">
        {label ? (
          <label
            htmlFor={controlId}
            className="cursor-pointer text-sm leading-tight text-white/85 select-none"
          >
            {label}
          </label>
        ) : null}

        {description ? <span className="text-xs text-white/45">{description}</span> : null}
      </span>
    </div>
  );
});
