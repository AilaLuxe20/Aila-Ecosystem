"use client";

import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { Select as SelectPrimitive } from "radix-ui";
import { forwardRef } from "react";

import { cn } from "@/lib/utils/cn";

import { useFieldControl } from "./Field";
import { fieldBase, menuSurfaceFallback } from "./select-styles";

/**
 * A single-choice dropdown.
 *
 * Radix Select renders a custom listbox rather than a native `<select>`, which
 * is what allows rich option content while preserving native keyboard
 * behaviour: typeahead, Home/End, and arrow traversal.
 */

/** The select root, owning the chosen value. */
export const Select = SelectPrimitive.Root;

/** Groups related options under a shared label. */
export const SelectGroup = SelectPrimitive.Group;

/** Renders the chosen option inside the trigger. */
export const SelectValue = SelectPrimitive.Value;

/** Props for {@link SelectTrigger}. */
export interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  /** Control height. Defaults to `"md"`. */
  readonly size?: "xs" | "sm" | "md" | "lg";
  /** Marks the control invalid. */
  readonly invalid?: boolean;
  /** Icon rendered before the value. */
  readonly icon?: React.ReactNode;
}

/**
 * The control that opens the listbox.
 *
 * Shares {@link fieldBase} with `Input`, so a select and a text field sitting
 * side by side are exactly the same height and weight.
 *
 * @param props - Size, validity, icon, and trigger attributes.
 * @returns The select trigger element.
 */
export const SelectTrigger = forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(function SelectTrigger({ className, size = "md", invalid, icon, children, ...props }, ref) {
  const field = useFieldControl({ invalid, disabled: props.disabled });
  const isInvalid = field["aria-invalid"] ?? false;

  return (
    <SelectPrimitive.Trigger
      ref={ref}
      id={field.id}
      aria-describedby={field["aria-describedby"]}
      className={cn(
        fieldBase({ size, invalid: isInvalid }),
        "flex items-center justify-between gap-2 text-start",
        "data-[placeholder]:text-white/30",
        className,
      )}
      {...props}
    >
      <span className="flex min-w-0 items-center gap-2 truncate">
        {icon ? <span className="shrink-0 text-white/40 [&_svg]:size-4">{icon}</span> : null}
        {children}
      </span>

      <SelectPrimitive.Icon asChild>
        <ChevronDown aria-hidden className="size-4 shrink-0 text-white/40" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});

/**
 * The listbox surface.
 *
 * Defaults to `position="popper"` so the list is anchored below the trigger
 * rather than overlaying it, which keeps the current selection visible.
 *
 * @param props - Position and content attributes.
 * @returns The select content, portalled to the document body.
 */
export const SelectContent = forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(function SelectContent({ className, children, position = "popper", ...props }, ref) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        position={position}
        sideOffset={6}
        className={cn(
          menuSurfaceFallback,
          "max-h-72 min-w-[var(--radix-select-trigger-width)]",
          className,
        )}
        {...props}
      >
        <SelectPrimitive.ScrollUpButton className="flex h-6 items-center justify-center text-white/40">
          <ChevronUp aria-hidden className="size-3.5" />
        </SelectPrimitive.ScrollUpButton>

        <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>

        <SelectPrimitive.ScrollDownButton className="flex h-6 items-center justify-center text-white/40">
          <ChevronDown aria-hidden className="size-3.5" />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});

/** Props for {@link SelectItem}. */
export interface SelectItemProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> {
  /** Helper text rendered beneath the label. */
  readonly description?: string;
  /** Icon rendered before the label. */
  readonly icon?: React.ReactNode;
}

/**
 * A selectable option.
 *
 * @param props - Description, icon, and item attributes.
 * @returns The select option element.
 */
export const SelectItem = forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Item>,
  SelectItemProps
>(function SelectItem({ className, children, description, icon, ...props }, ref) {
  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-start gap-2 rounded-[0.375rem] py-1.5 pe-8 ps-2",
        "text-sm text-white/80 outline-none transition-colors duration-instant",
        "data-[highlighted]:bg-surface-raised data-[highlighted]:text-white",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
        className,
      )}
      {...props}
    >
      {icon ? <span className="mt-0.5 shrink-0 text-white/45 [&_svg]:size-4">{icon}</span> : null}

      <span className="min-w-0 flex-1">
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        {description ? <span className="block text-xs text-white/40">{description}</span> : null}
      </span>

      <SelectPrimitive.ItemIndicator className="absolute end-2 top-2">
        <Check aria-hidden className="size-3.5 text-brand-400" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
});

/**
 * A heading above a group of options.
 *
 * @param props - Label attributes.
 * @returns The group label element.
 */
export const SelectLabel = forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(function SelectLabel({ className, ...props }, ref) {
  return (
    <SelectPrimitive.Label
      ref={ref}
      className={cn("px-2 py-1.5 text-2xs font-medium tracking-wide text-white/35 uppercase", className)}
      {...props}
    />
  );
});

/**
 * A dividing line between option groups.
 *
 * @param props - Separator attributes.
 * @returns The separator element.
 */
export const SelectSeparator = forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(function SelectSeparator({ className, ...props }, ref) {
  return (
    <SelectPrimitive.Separator
      ref={ref}
      className={cn("-mx-1 my-1 h-px bg-hairline", className)}
      {...props}
    />
  );
});
