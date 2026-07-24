/**
 * Command Action
 *
 * Represents the executable action for a command.
 * A command action receives a CommandContext and may
 * return a void or a Promise for async operations.
 */

import type { CommandContext } from "./types";

export type CommandAction = (
  context: CommandContext
) => void | Promise<void>;
