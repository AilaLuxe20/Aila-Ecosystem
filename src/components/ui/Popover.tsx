"use client";

import { HoverCard as HoverCardPrimitive, Popover as PopoverPrimitive } from "radix-ui";
import { forwardRef } from "react";

import { INTERACTION_CONFIG } from "@/lib/config/app";
import { cn } from "@/lib/utils/cn";

/**
 * Floating surfaces anchored to a trigger.
 *
 * All three share one set of animation and surface classes so a popover, a
 * tooltip, and a hover card feel like the same mechanism at different weights.
 */

/** Shared surface and enter/exit animation for anchored content. */
const floatingSurface = [
  "z-50 rounded-panel border border-hairline bg-surface-overlay shadow-elevation-4",
  "focus:outline-none",
  "data-[state=open]:animate-in data-[state=closed]:animate-out",
  "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
  "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
  "data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1",
  "data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1",
].join(" ");

/** The popover root, owning open state. */
export const Popover = PopoverPrimitive.Root;

/** Element that toggles the popover. */
export const PopoverTrigger = PopoverPrimitive.Trigger;

/** Closes the popover from within its content. */
export const PopoverClose = PopoverPrimitive.Close;

/**
 * Positions a popover against an element other than its trigger.
 *
 * Useful when the visual anchor differs from the control that opens it.
 */
export const PopoverAnchor = PopoverPrimitive.Anchor;

/**
 * The popover surface.
 *
 * `collisionPadding` keeps the panel clear of the viewport edge, so a popover
 * near the bottom of the screen flips above its trigger rather than being
 * clipped.
 *
 * @param props - Alignment, offset, and popover content attributes.
 * @returns The popover content, portalled to the document body.
 *
 * @example
 * <Popover>
 *   <PopoverTrigger asChild><IconButton label="Options" icon={<MoreHorizontal />} /></PopoverTrigger>
 *   <PopoverContent>…</PopoverContent>
 * </Popover>
 */
export const PopoverContent = forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(function PopoverContent({ className, align = "center", sideOffset = 8, ...props }, ref) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        collisionPadding={12}
        className={cn(floatingSurface, "w-72 p-4 text-sm text-white/80", className)}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
});

/** The hover card root, owning open state. */
export const HoverCard = HoverCardPrimitive.Root;

/** Element that opens the hover card on hover or focus. */
export const HoverCardTrigger = HoverCardPrimitive.Trigger;

/**
 * The hover card surface.
 *
 * Distinct from a tooltip: a hover card holds rich, interactive content and
 * stays open while the pointer travels into it.
 *
 * @param props - Alignment, offset, and hover card content attributes.
 * @returns The hover card content, portalled to the document body.
 */
export const HoverCardContent = forwardRef<
  React.ComponentRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(function HoverCardContent({ className, align = "center", sideOffset = 8, ...props }, ref) {
  return (
    <HoverCardPrimitive.Portal>
      <HoverCardPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        collisionPadding={12}
        className={cn(floatingSurface, "w-72 p-4 text-sm text-white/80", className)}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  );
});

/** Props for {@link HoverCardRoot}. */
export type HoverCardRootProps = React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Root>;

/**
 * A hover card with platform-standard open and close delays.
 *
 * The close delay matters: without it, the card vanishes the instant the
 * pointer leaves the trigger, making the content unreachable.
 *
 * @param props - Hover card root attributes.
 * @returns The configured hover card root.
 */
export function HoverCardRoot({
  openDelay = INTERACTION_CONFIG.tooltipDelayMs,
  closeDelay = 150,
  ...props
}: HoverCardRootProps): React.JSX.Element {
  return <HoverCardPrimitive.Root openDelay={openDelay} closeDelay={closeDelay} {...props} />;
}

export { floatingSurface };
