/**
 * Command Registry
 *
 * Manages command registration, lookup, search, and execution
 * for the Aila Command Center.
 */

import type {
  Command,
  CommandCategory,
  CommandContext,
  CommandCenterState,
} from "./types";

export class CommandRegistry {
  private state: CommandCenterState = {
    commands: new Map(),
    categories: new Map(),
    aiProviders: [],
    systemStatus: {
      platform: "online",
      aiProviders: [],
      activeProducts: 0,
      totalProducts: 0,
      workspace: "active",
    },
  };

  register(command: Command): void {
    this.state.commands.set(command.id, command);

    const catCommands =
      this.state.categories.get(command.category) ?? [];
    if (!catCommands.includes(command.id)) {
      catCommands.push(command.id);
      this.state.categories.set(command.category, catCommands);
    }
  }

  unregister(id: string): boolean {
    const command = this.state.commands.get(id);
    if (!command) return false;

    this.state.commands.delete(id);

    const catCommands =
      this.state.categories.get(command.category) ?? [];
    const index = catCommands.indexOf(id);
    if (index > -1) {
      catCommands.splice(index, 1);
      this.state.categories.set(command.category, catCommands);
    }

    return true;
  }

  get(id: string): Command | undefined {
    return this.state.commands.get(id);
  }

  getAll(): Command[] {
    return Array.from(this.state.commands.values());
  }

  getByCategory(category: CommandCategory): Command[] {
    const ids = this.state.categories.get(category) ?? [];
    return ids
      .map((id) => this.state.commands.get(id))
      .filter(Boolean) as Command[];
  }

  search(query: string, limit = 20): Command[] {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const results: Command[] = [];

    for (const command of this.state.commands.values()) {
      if (results.length >= limit) break;

      const labelMatch = command.label
        .toLowerCase()
        .includes(q);
      const descMatch = command.description
        ?.toLowerCase()
        .includes(q);

      if (labelMatch || descMatch) {
        results.push(command);
      }
    }

    return results;
  }

  async execute(
    id: string,
    context: CommandContext = {}
  ): Promise<void> {
    const command = this.state.commands.get(id);
    if (!command) {
      console.warn(`Command not found: ${id}`);
      return;
    }

    if (command.enabled === false) {
      console.warn(`Command disabled: ${id}`);
      return;
    }

    try {
      await command.execute(context);
    } catch (error) {
      console.error(`Command execution error [${id}]:`, error);
    }
  }

  getState(): CommandCenterState {
    return this.state;
  }

  clear(): void {
    this.state.commands.clear();
    this.state.categories.clear();
  }
}

export const commandRegistry = new CommandRegistry();
