/**
 * Command Executor
 *
 * Interface for objects that can execute commands.
 * The CommandRegistry implements this interface to
 * provide centralized command execution with error
 * handling and lifecycle management.
 */

import type { CommandContext } from "./types";

export interface CommandExecutor {
  execute(
    id: string,
    context?: CommandContext
  ): Promise<void>;
}
