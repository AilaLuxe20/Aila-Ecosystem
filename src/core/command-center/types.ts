/**
 * Command Center Types
 *
 * Central type definitions for the Aila Command Center.
 * This file re-exports types from individual modules and
 * defines additional types used across the command center.
 */

// Local imports for use within this file
import type { Command } from "./Command";
import type { CommandCategory } from "./CommandCategory";

// Re-export from individual modules
export type { CommandCategory, COMMAND_CATEGORY_LABELS } from "./CommandCategory";
export type { CommandAction } from "./CommandAction";
export type { CommandExecutor } from "./CommandExecutor";
export type { Command } from "./Command";
export type { CommandPaletteState } from "./CommandPaletteState";
export type {
  CommandHistoryEntry,
  CommandHistoryOptions,
} from "./CommandHistory";
export type {
  CommandSearchResult,
  CommandSearchState,
} from "./CommandSearch";

// --- Core context type ---

/**
 * Context passed to command execution functions.
 * Contains arbitrary key-value pairs that commands can use
 * to access platform state, user data, or other runtime info.
 */
export interface CommandContext {
  [key: string]: unknown;
}

// --- AI Provider types ---

export type AIProviderType =
  | "openrouter"
  | "openai"
  | "anthropic";

export type AIProviderStatus =
  | "connected"
  | "error"
  | "disconnected"
  | "unknown";

export interface AIProvider {
  id: string;
  name: string;
  type: AIProviderType;
  status: AIProviderStatus;
  model: string;
  endpoint: string;
  lastChecked?: Date;
}

// --- System status types ---

export type PlatformStatus = "online" | "degraded" | "offline";
export type WorkspaceStatus = "active" | "inactive";

export interface SystemStatus {
  platform: PlatformStatus;
  aiProviders: AIProvider[];
  activeProducts: number;
  totalProducts: number;
  workspace: WorkspaceStatus;
}

// --- Command Center state ---

export interface CommandCenterState {
  commands: Map<string, Command>;
  categories: Map<CommandCategory, string[]>;
  aiProviders: AIProvider[];
  systemStatus: SystemStatus;
}
