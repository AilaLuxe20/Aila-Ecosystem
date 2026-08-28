"use client";

import { Tooltip as TooltipPrimitive } from "radix-ui";
import { forwardRef } from "react";

import { INTERACTION_CONFIG } from "@/lib/config/app";
import { cn } from "@/lib/utils/cn";

import { floatingSurface } from "./Popover";

/**
 * Supplies shared tooltip timing to a subtree.
 *
 * Mount once near the application root. The `skipDelayDuration` is what makes a
 * toolbar feel responsive: after the first tooltip opens, neighbouring triggers
 * show theirs instantly instead of re-waiting the full delay.
 */
export const TooltipProvider = TooltipPrimitive.Provider;

/** The tooltip root, owning open state. */
export const TooltipRoot = TooltipPrimitive.Root;

/** Element the tooltip describes. */
export const TooltipTrigger = TooltipPrimitive.Trigger;

/**
 * The tooltip surface.
 *
 * @param props - Alignment, offset, and tooltip content attributes.
 * @returns The tooltip content, portalled to the document body.
 */
export const TooltipContent = forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(function TooltipContent({ className, sideOffset = 6, ...props }, ref) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        collisionPadding={8}
        className={cn(
          floatingSurface,
          "max-w-xs px-2.5 py-1.5 text-xs leading-snug text-white shadow-elevation-3",
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
});

/** Props for {@link Tooltip}. */
export interface TooltipProps {
  /** The tooltip text. Keep it to a short phrase. */
  readonly content: React.ReactNode;
  /** The element being described. */
  readonly children: React.ReactNode;
  /** Preferred side. Defaults to `"top"`. */
  readonly side?: "top" | "right" | "bottom" | "left";
  /** Alignment along the chosen side. */
  readonly align?: "start" | "center" | "end";
  /** Delay before opening, in milliseconds. */
  readonly delayMs?: number;
  /** Suppresses the tooltip without changing the markup around it. */
  readonly disabled?: boolean;
}

/**
 * A short hint shown on hover or keyboard focus.
 *
 * A tooltip must only ever supplement a control that already has an accessible
 * name — it is not a substitute for one, because touch users never see it.
 *
 * @param props - Content, placement, delay, and the trigger element.
 * @returns The wrapped trigger, or the trigger alone when disabled.
 *
 * @example
 * <Tooltip content="Duplicate">
 *   <IconButton label="Duplicate" icon={<Copy />} />
 * </Tooltip>
 */
export function Tooltip({
  content,
  children,
  side = "top",
  align = "center",
  delayMs = INTERACTION_CONFIG.tooltipDelayMs,
  disabled = false,
}: TooltipProps): React.JSX.Element {
  if (disabled) return <>{children}</>;

  return (
    <TooltipPrimitive.Root delayDuration={delayMs}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipContent side={side} align={align}>
        {content}
      </TooltipContent>
    </TooltipPrimitive.Root>
  );
}

/** Props for {@link AppTooltipProvider}. */
export interface AppTooltipProviderProps {
  readonly children: React.ReactNode;
}

/**
 * Tooltip provider preconfigured with the platform's timing.
 *
 * @param props - The subtree to provide timing to.
 * @returns The provider element.
 */
export function AppTooltipProvider({ children }: AppTooltipProviderProps): React.JSX.Element {
  return (
    <TooltipPrimitive.Provider
      delayDuration={INTERACTION_CONFIG.tooltipDelayMs}
      skipDelayDuration={300}
    >
      {children}
    </TooltipPrimitive.Provider>
  );
}
