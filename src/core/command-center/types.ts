/**
 * Command Center Types
 *
 * Type definitions for the Aila Command Center — the central
 * control panel for managing AI providers, commands, system
 * status, and platform integration.
 */

import type { Product } from "@/config/products";

export type CommandCategory =
  | "system"
  | "navigation"
  | "product"
  | "ai"
  | "workspace"
  | "settings"
  | "developer";

export interface CommandContext {
  productId?: string;
  workspaceId?: string;
  meta?: Record<string, unknown>;
}

export interface Command {
  id: string;
  label: string;
  description?: string;
  category: CommandCategory;
  icon?: string;
  shortcut?: string;
  enabled?: boolean;
  scope?: string;
  execute: (context: CommandContext) => Promise<void> | void;
}

export interface AIProvider {
  id: string;
  name: string;
  type: "openrouter" | "openai" | "anthropic" | "google" | "custom";
  status: "connected" | "disconnected" | "error" | "unknown";
  model?: string;
  endpoint?: string;
  lastChecked?: Date;
}

export interface SystemStatus {
  platform: "online" | "offline" | "degraded";
  aiProviders: AIProvider[];
  activeProducts: number;
  totalProducts: number;
  workspace: "active" | "inactive";
  lastSync?: Date;
}

export interface CommandCenterState {
  commands: Map<string, Command>;
  categories: Map<CommandCategory, string[]>;
  aiProviders: AIProvider[];
  systemStatus: SystemStatus;
}

export interface CommandCenterConfig {
  /** Products registered in the platform. */
  products: Product[];
  /** Whether the command palette is enabled. */
  enablePalette: boolean;
  /** Whether AI provider management is enabled. */
  enableAIManagement: boolean;
}
