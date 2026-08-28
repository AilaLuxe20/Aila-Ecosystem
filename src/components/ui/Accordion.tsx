"use client";

import { ChevronDown } from "lucide-react";
import { Accordion as AccordionPrimitive } from "radix-ui";
import { forwardRef } from "react";

import { cn } from "@/lib/utils/cn";

import { focusRing } from "./variants";

/**
 * Collapsible content sections.
 *
 * Radix animates height using the `--radix-accordion-content-height` custom
 * property, which is what makes a smooth open/close transition possible without
 * measuring the panel in JavaScript on every render.
 */

/** The accordion root. Set `type="single"` or `"multiple"` to control behaviour. */
export const Accordion = AccordionPrimitive.Root;

/** Props for {@link AccordionItem}. */
export type AccordionItemProps = React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>;

/**
 * A single collapsible section.
 *
 * @param props - Item attributes, including the required `value`.
 * @returns The accordion item element.
 */
export const AccordionItem = forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Item>,
  AccordionItemProps
>(function AccordionItem({ className, ...props }, ref) {
  return (
    <AccordionPrimitive.Item
      ref={ref}
      className={cn("border-b border-hairline last:border-b-0", className)}
      {...props}
    />
  );
});

/** Props for {@link AccordionTrigger}. */
export interface AccordionTriggerProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {
  /** Icon rendered before the label. */
  readonly icon?: React.ReactNode;
}

/**
 * The heading that toggles a section.
 *
 * Wrapped in an `AccordionPrimitive.Header` so the trigger is exposed as a
 * heading to assistive technology and appears in a document outline.
 *
 * @param props - Icon and trigger attributes.
 * @returns The accordion trigger element.
 */
export const AccordionTrigger = forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(function AccordionTrigger({ className, icon, children, ...props }, ref) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "group flex flex-1 items-center gap-3 py-4 text-start text-sm font-medium text-white",
          "transition-colors duration-fast hover:text-brand-300",
          "disabled:pointer-events-none disabled:opacity-40",
          focusRing,
          className,
        )}
        {...props}
      >
        {icon ? <span className="shrink-0 text-white/45 [&_svg]:size-4">{icon}</span> : null}

        <span className="flex-1">{children}</span>

        <ChevronDown
          aria-hidden
          className="size-4 shrink-0 text-white/40 transition-transform duration-normal ease-standard group-data-[state=open]:rotate-180"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});

/**
 * The collapsible panel belonging to a section.
 *
 * @param props - Content attributes.
 * @returns The accordion content element.
 */
export const AccordionContent = forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(function AccordionContent({ className, children, ...props }, ref) {
  return (
    <AccordionPrimitive.Content
      ref={ref}
      className={cn(
        "overflow-hidden text-sm text-white/70",
        "data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up",
      )}
      {...props}
    >
      <div className={cn("pb-4 leading-relaxed", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
});
