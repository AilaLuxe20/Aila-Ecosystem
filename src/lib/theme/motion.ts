import type { Transition, Variants } from "framer-motion";

import { EASINGS, durationSeconds } from "./tokens";

/**
 * Shared Framer Motion presets.
 *
 * Centralising variants keeps motion consistent: a drawer, a popover, and a
 * dialog all decelerate on the same curve, so the interface feels like one
 * system rather than a collection of independently animated parts.
 */

/** Standard transition for most enter and exit animations. */
export const standardTransition: Transition = {
  duration: durationSeconds("normal"),
  ease: EASINGS.standard,
};

/** Faster transition for hover and focus feedback. */
export const fastTransition: Transition = {
  duration: durationSeconds("fast"),
  ease: EASINGS.standard,
};

/** Emphasised transition for elements that command attention, e.g. dialogs. */
export const emphasizedTransition: Transition = {
  duration: durationSeconds("slow"),
  ease: EASINGS.emphasized,
};

/** Spring transition for direct-manipulation surfaces such as drawers. */
export const springTransition: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 34,
  mass: 0.9,
};

/** Simple opacity fade. */
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: standardTransition },
  exit: { opacity: 0, transition: fastTransition },
};

/** Fade combined with a short upward travel. */
export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: standardTransition },
  exit: { opacity: 0, y: 4, transition: fastTransition },
};

/** Scale and fade, anchored at the trigger. Used by popovers and menus. */
export const popVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: fastTransition },
  exit: { opacity: 0, scale: 0.98, transition: fastTransition },
};

/** Dialog entrance: lifts slightly as it scales in. */
export const dialogVariants: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: emphasizedTransition },
  exit: { opacity: 0, scale: 0.98, y: 4, transition: fastTransition },
};

/** Backdrop behind a modal surface. */
export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: fastTransition },
  exit: { opacity: 0, transition: fastTransition },
};

/** Collapsible region driven by height. */
export const collapseVariants: Variants = {
  hidden: { height: 0, opacity: 0, transition: fastTransition },
  visible: { height: "auto", opacity: 1, transition: standardTransition },
};

/** Toast entering from the edge of the viewport. */
export const toastVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: springTransition },
  exit: { opacity: 0, y: 8, scale: 0.98, transition: fastTransition },
};

/**
 * Builds slide variants for a drawer entering from a given edge.
 *
 * @param side - Edge the drawer is anchored to.
 * @returns Variants that slide the panel fully off-screen when hidden.
 */
export function drawerVariants(side: "left" | "right" | "top" | "bottom"): Variants {
  const offset = side === "left" || side === "top" ? "-100%" : "100%";

  // Written as two explicit branches rather than a computed `[axis]` key: a
  // computed key widens the object to a string index signature, which no longer
  // satisfies Framer Motion's `Variant` type.
  if (side === "left" || side === "right") {
    return {
      hidden: { x: offset, transition: standardTransition },
      visible: { x: 0, transition: springTransition },
      exit: { x: offset, transition: standardTransition },
    };
  }

  return {
    hidden: { y: offset, transition: standardTransition },
    visible: { y: 0, transition: springTransition },
    exit: { y: offset, transition: standardTransition },
  };
}

/**
 * Builds a container variant that staggers its children.
 *
 * @param staggerSeconds - Delay between each child. Defaults to 0.04s.
 * @param delaySeconds - Delay before the first child. Defaults to 0.
 * @returns Variants driving the stagger.
 */
export function staggerVariants(staggerSeconds = 0.04, delaySeconds = 0): Variants {
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerSeconds,
        delayChildren: delaySeconds,
      },
    },
  };
}
