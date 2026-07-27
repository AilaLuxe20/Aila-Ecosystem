"use client";

import { Tabs as TabsPrimitive } from "radix-ui";
import { forwardRef } from "react";

import { cn } from "@/lib/utils/cn";

import { cva, focusRing, type VariantProps } from "./variants";

/**
 * Tabbed navigation.
 *
 * Radix implements the WAI-ARIA tabs pattern: arrow-key traversal, roving
 * tabindex, and correct `aria-controls` wiring. Only the visual treatment is
 * defined here.
 */

const tabsListVariants = cva("inline-flex items-center", {
  variants: {
    variant: {
      /** Segmented control on a sunken track. */
      pill: "gap-1 rounded-control bg-surface-sunken p-1",
      /** Classic underlined tabs, separated by a hairline. */
      underline: "gap-1 border-b border-hairline",
      /** Bordered tabs that read as folder edges. */
      enclosed: "gap-0 border-b border-hairline",
    },
    fullWidth: { true: "w-full", false: "" },
  },
  defaultVariants: { variant: "pill", fullWidth: false },
});

const tabsTriggerVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium",
    "transition-colors duration-fast ease-standard",
    "disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:size-4",
    focusRing,
  ].join(" "),
  {
    variants: {
      variant: {
        pill: [
          "rounded-[0.375rem] px-3 py-1.5 text-xs text-white/55",
          "hover:text-white/80",
          "data-[state=active]:bg-surface-raised data-[state=active]:text-white data-[state=active]:shadow-elevation-1",
        ].join(" "),
        underline: [
          "relative -mb-px border-b-2 border-transparent px-3 py-2 text-sm text-white/55",
          "hover:text-white/80",
          "data-[state=active]:border-brand-500 data-[state=active]:text-white",
        ].join(" "),
        enclosed: [
          "relative -mb-px rounded-t-control border border-transparent px-4 py-2 text-sm text-white/55",
          "hover:text-white/80",
          "data-[state=active]:border-hairline data-[state=active]:border-b-surface data-[state=active]:bg-surface data-[state=active]:text-white",
        ].join(" "),
      },
      fullWidth: { true: "flex-1", false: "" },
    },
    defaultVariants: { variant: "pill", fullWidth: false },
  },
);

/** The tabs root, owning the active value. */
export const Tabs = TabsPrimitive.Root;

/** Props for {@link TabsList}. */
export interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {}

/**
 * The container holding the tab triggers.
 *
 * @param props - Variant, full-width flag, and list attributes.
 * @returns The tab list element.
 */
export const TabsList = forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  TabsListProps
>(function TabsList({ className, variant, fullWidth, ...props }, ref) {
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(tabsListVariants({ variant, fullWidth }), className)}
      {...props}
    />
  );
});

/** Props for {@link TabsTrigger}. */
export interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>,
    VariantProps<typeof tabsTriggerVariants> {
  /** Icon rendered before the label. */
  readonly icon?: React.ReactNode;
  /** Count or status rendered after the label. */
  readonly badge?: React.ReactNode;
}

/**
 * A single tab.
 *
 * The `variant` must match the one on {@link TabsList}, since the two halves of
 * the treatment are split across both elements.
 *
 * @param props - Variant, icon, badge, and trigger attributes.
 * @returns The tab trigger element.
 */
export const TabsTrigger = forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(function TabsTrigger({ className, variant, fullWidth, icon, badge, children, ...props }, ref) {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(tabsTriggerVariants({ variant, fullWidth }), className)}
      {...props}
    >
      {icon}
      {children}
      {badge}
    </TabsPrimitive.Trigger>
  );
});

/**
 * The panel associated with a tab.
 *
 * @param props - Content attributes.
 * @returns The tab panel element.
 */
export const TabsContent = forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(function TabsContent({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn("mt-4 focus-visible:outline-none", className)}
      {...props}
    />
  );
});

export { tabsListVariants, tabsTriggerVariants };
