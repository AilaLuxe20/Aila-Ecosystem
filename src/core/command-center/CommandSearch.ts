/**
 * Command Search
 *
 * Provides search and filtering capabilities for commands
 * in the Aila Command Center. Supports fuzzy matching
 * across command labels, descriptions, and categories.
 */

import type { Command } from "./Command";
import type { CommandCategory } from "./CommandCategory";

/** Result of a command search operation */
export interface CommandSearchResult {
  command: Command;
  /** Match score from 0 to 1 (higher = better match) */
  score: number;
  /** Which fields matched the query */
  matches: ("label" | "description" | "category")[];
}

/** State for command search operations */
export interface CommandSearchState {
  query: string;
  results: Command[];
  isLoading: boolean;
}

/**
 * Compute a simple relevance score for a command against a query.
 * Returns 0 if there is no match.
 */
function scoreCommand(
  command: Command,
  query: string
): { score: number; matches: ("label" | "description" | "category")[] } {
  const matches: ("label" | "description" | "category")[] = [];
  let score = 0;

  const q = query.toLowerCase().trim();

  if (!q) return { score: 0, matches };

  // Label match (highest weight)
  const labelLower = command.label.toLowerCase();
  if (labelLower.includes(q)) {
    matches.push("label");
    // Boost for exact match or prefix match
    if (labelLower === q) {
      score += 1.0;
    } else if (labelLower.startsWith(q)) {
      score += 0.8;
    } else {
      score += 0.5;
    }
  }

  // Description match (medium weight)
  if (command.description) {
    const descLower = command.description.toLowerCase();
    if (descLower.includes(q)) {
      matches.push("description");
      score += 0.3;
    }
  }

  // Category match (low weight)
  const catLower = command.category.toLowerCase();
  if (catLower.includes(q)) {
    matches.push("category");
    score += 0.2;
  }

  // Shortcut match
  if (command.shortcut) {
    const shortcutLower = command.shortcut.toLowerCase();
    if (shortcutLower.includes(q)) {
      matches.push("category");
      score += 0.4;
    }
  }

  return { score, matches };
}

export class CommandSearch {
  /**
   * Search commands by query string.
   * Returns results sorted by relevance score (descending).
   */
  search(
    commands: Command[],
    query: string,
    limit = 20
  ): CommandSearchResult[] {
    if (!query.trim()) return [];

    const results = commands
      .map((command) => ({
        command,
        ...scoreCommand(command, query),
      }))
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return results;
  }

  /**
   * Filter commands by category.
   */
  filterByCategory(
    commands: Command[],
    category: CommandCategory
  ): Command[] {
    return commands.filter(
      (command) => command.category === category
    );
  }

  /**
   * Filter commands by enabled status.
   */
  filterEnabled(commands: Command[]): Command[] {
    return commands.filter(
      (command) => command.enabled !== false
    );
  }

  /**
   * Sort commands by priority (descending) then alphabetically.
   */
  sortCommands(commands: Command[]): Command[] {
    return [...commands].sort((a, b) => {
      const priorityA = a.priority ?? 0;
      const priorityB = b.priority ?? 0;

      if (priorityB !== priorityA) {
        return priorityB - priorityA;
      }

      return a.label.localeCompare(b.label);
    });
  }

  /**
   * Group commands by their category.
   */
  groupByCategory(
    commands: Command[]
  ): Map<CommandCategory, Command[]> {
    const groups = new Map<CommandCategory, Command[]>();

    for (const command of commands) {
      const existing =
        groups.get(command.category) ?? [];
      existing.push(command);
      groups.set(command.category, existing);
    }

    return groups;
  }

  /**
   * Get all unique categories from a set of commands.
   */
  getCategories(commands: Command[]): CommandCategory[] {
    const categories = new Set<CommandCategory>();

    for (const command of commands) {
      categories.add(command.category);
    }

    return Array.from(categories);
  }
}

/** Singleton instance for the command center */
export const commandSearch = new CommandSearch();
