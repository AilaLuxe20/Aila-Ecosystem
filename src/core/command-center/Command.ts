/**
 * Command
 *
 * Represents a single command in the Aila Command Center.
 * Commands are registered with the CommandRegistry and can
 * be searched, executed, and displayed in the command palette.
 *
 * Each command has a unique id, a human-readable label, a
 * category for grouping, and an execute function that performs
 * the command's action.
 */

import type { CommandAction } from "./CommandAction";
import type { CommandCategory } from "./CommandCategory";
import type { CommandContext } from "./types";

export interface Command {
  /** Unique identifier for the command (e.g. "nav.dashboard") */
  id: string;

  /** Human-readable label displayed in the palette */
  label: string;

  /** Optional description shown as secondary text */
  description?: string;

  /** Category used for grouping and filtering */
  category: CommandCategory;

  /** Optional emoji or icon string */
  icon?: string;

  /** Optional keyboard shortcut hint (e.g. "G D") */
  shortcut?: string;

  /** Function executed when the command is invoked */
  execute: (context: CommandContext) => void | Promise<void>;

  /** Optional action alias (alternative to execute) */
  action?: CommandAction;

  /** When false, the command is shown as disabled */
  enabled?: boolean;

  /** Optional priority for sorting (higher = more prominent) */
  priority?: number;
}
