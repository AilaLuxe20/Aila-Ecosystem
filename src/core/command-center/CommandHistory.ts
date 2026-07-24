/**
 * Command History
 *
 * Tracks executed commands for the Aila Command Center.
 * Maintains a bounded list of command execution entries
 * that can be retrieved for display in history views
 * or for quick re-execution.
 */

import type { Command } from "./Command";
import type { CommandContext } from "./types";

/** A single entry in the command history */
export interface CommandHistoryEntry {
  /** Unique entry identifier */
  id: string;

  /** The command that was executed */
  command: Command;

  /** Context passed to the command */
  context: CommandContext;

  /** When the command was executed */
  timestamp: Date;
}

/** Options for constructing a CommandHistory */
export interface CommandHistoryOptions {
  /** Maximum number of entries to retain (default: 100) */
  maxEntries?: number;
}

export class CommandHistory {
  private entries: CommandHistoryEntry[] = [];
  private readonly maxEntries: number;

  constructor(options: CommandHistoryOptions = {}) {
    this.maxEntries = options.maxEntries ?? 100;
  }

  /** Record a command execution in history */
  record(
    command: Command,
    context: CommandContext = {}
  ): CommandHistoryEntry {
    const entry: CommandHistoryEntry = {
      id: crypto.randomUUID(),
      command,
      context,
      timestamp: new Date(),
    };

    this.entries.unshift(entry);

    // Trim to max entries
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(0, this.maxEntries);
    }

    return entry;
  }

  /** Get all history entries */
  getAll(): CommandHistoryEntry[] {
    return [...this.entries];
  }

  /** Get entries for a specific command id */
  getByCommandId(commandId: string): CommandHistoryEntry[] {
    return this.entries.filter(
      (entry) => entry.command.id === commandId
    );
  }

  /** Get the most recent N entries */
  getRecent(limit = 10): CommandHistoryEntry[] {
    return this.entries.slice(0, limit);
  }

  /** Get the last executed entry */
  getLast(): CommandHistoryEntry | undefined {
    return this.entries[0];
  }

  /** Check if a command has been executed before */
  has(commandId: string): boolean {
    return this.entries.some(
      (entry) => entry.command.id === commandId
    );
  }

  /** Remove a specific entry by id */
  remove(id: string): boolean {
    const index = this.entries.findIndex(
      (entry) => entry.id === id
    );

    if (index === -1) return false;

    this.entries.splice(index, 1);
    return true;
  }

  /** Remove all entries for a specific command id */
  removeByCommandId(commandId: string): number {
    const before = this.entries.length;
    this.entries = this.entries.filter(
      (entry) => entry.command.id !== commandId
    );
    return before - this.entries.length;
  }

  /** Clear all history entries */
  clear(): void {
    this.entries = [];
  }

  /** Get the current number of entries */
  get size(): number {
    return this.entries.length;
  }

  /** Get the maximum entries capacity */
  get capacity(): number {
    return this.maxEntries;
  }
}

/** Singleton instance for the command center */
export const commandHistory = new CommandHistory();
