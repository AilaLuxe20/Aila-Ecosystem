/**
 * Command Center
 *
 * Main entry point for the Aila Command Center.
 * Provides a unified API for command registration, search,
 * execution, and history management.
 *
 * This module ties together the CommandRegistry, CommandSearch,
 * CommandHistory, and CommandPalette into a single cohesive
 * command center that can be used throughout the Aila Ecosystem.
 */

import { CommandRegistry, commandRegistry } from "./CommandRegistry";
import { CommandSearch, commandSearch } from "./CommandSearch";
import { CommandHistory, commandHistory } from "./CommandHistory";
import { registerDefaultCommands } from "./defaultCommands";
import type { Command, CommandContext } from "./types";

/**
 * The CommandCenter class provides a high-level API for
 * managing commands within the Aila Ecosystem.
 */
export class CommandCenter {
  readonly registry: CommandRegistry;
  readonly search: CommandSearch;
  readonly history: CommandHistory;

  constructor(
    registry: CommandRegistry = commandRegistry,
    search: CommandSearch = commandSearch,
    history: CommandHistory = commandHistory
  ) {
    this.registry = registry;
    this.search = search;
    this.history = history;
  }

  /** Register a single command */
  register(command: Command): void {
    this.registry.register(command);
  }

  /** Register multiple commands */
  registerMany(commands: Command[]): void {
    commands.forEach((cmd) => this.register(cmd));
  }

  /** Unregister a command by id */
  unregister(id: string): boolean {
    return this.registry.unregister(id);
  }

  /** Get a command by id */
  get(id: string): Command | undefined {
    return this.registry.get(id);
  }

  /** Get all registered commands */
  getAll(): Command[] {
    return this.registry.getAll();
  }

  /** Search commands by query */
  searchCommands(query: string, limit = 20) {
    return this.search.search(this.getAll(), query, limit);
  }

  /** Execute a command by id */
  async execute(
    id: string,
    context: CommandContext = {}
  ): Promise<void> {
    const command = this.registry.get(id);

    if (command) {
      this.history.record(command, context);
    }

    await this.registry.execute(id, context);
  }

  /** Get command history */
  getHistory() {
    return this.history.getAll();
  }

  /** Clear command history */
  clearHistory(): void {
    this.history.clear();
  }

  /** Register all default commands */
  registerDefaults(): void {
    registerDefaultCommands();
  }

  /** Get the current state */
  getState() {
    return this.registry.getState();
  }

  /** Clear all commands and history */
  reset(): void {
    this.registry.clear();
    this.history.clear();
  }
}

/** Singleton CommandCenter instance */
export const commandCenter = new CommandCenter();

// Re-export key APIs
export {
  CommandRegistry,
  commandRegistry,
  CommandSearch,
  commandSearch,
  CommandHistory,
  commandHistory,
  registerDefaultCommands,
};

export type {
  Command,
  CommandAction,
  CommandCategory,
  CommandContext,
  CommandExecutor,
  CommandPaletteState,
  CommandHistoryEntry,
  CommandSearchResult,
  CommandSearchState,
  AIProvider,
  AIProviderType,
  AIProviderStatus,
  SystemStatus,
  PlatformStatus,
  WorkspaceStatus,
  CommandCenterState,
} from "./types";

export type { CommandHistoryOptions } from "./CommandHistory";
export type { CommandSearchState as SearchState } from "./CommandSearch";
