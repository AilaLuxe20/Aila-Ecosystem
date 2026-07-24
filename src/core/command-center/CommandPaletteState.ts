/**
 * Command Palette State
 *
 * Defines the state shape for the CommandPalette component.
 * This state tracks the open/closed status, the current search
 * query, the selected result index, and the active results.
 */

import type { Command } from "./Command";

export interface CommandPaletteState {
  /** Whether the palette is currently visible */
  isOpen: boolean;

  /** Current search query text */
  query: string;

  /** Index of the currently highlighted result */
  selectedIndex: number;

  /** Current search results */
  results: Command[];
}
