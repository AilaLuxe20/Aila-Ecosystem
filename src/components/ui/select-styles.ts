/**
 * Styles shared between `Select`, `Combobox`, and `CommandPalette`.
 *
 * These three render the same visual surface but are built on different Radix
 * primitives, so the classes live here rather than being imported across
 * component modules and creating a cycle.
 */

export { fieldBase } from "./variants";

/**
 * Listbox surface used by anchored option lists.
 *
 * Kept separate from the menu surface in `Menu.tsx` because a listbox scrolls
 * and a menu does not, which changes the overflow and max-height handling.
 */
export const menuSurfaceFallback = [
  "relative z-50 overflow-hidden rounded-panel border border-hairline",
  "bg-surface-overlay shadow-elevation-4",
  "data-[state=open]:animate-in data-[state=closed]:animate-out",
  "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
  "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
  "data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1",
].join(" ");
