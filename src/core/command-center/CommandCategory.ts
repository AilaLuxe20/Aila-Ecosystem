/**
 * Command Category
 *
 * Defines the categories that commands can belong to within
 * the Aila Command Center. These categories are used for
 * grouping, filtering, and organizing commands in the palette
 * and registry viewer.
 */

export type CommandCategory =
  | "system"
  | "navigation"
  | "product"
  | "ai"
  | "workspace"
  | "settings"
  | "developer";

/**
 * Human-readable labels for each command category.
 * Used by UI components to display category names.
 */
export const COMMAND_CATEGORY_LABELS: Record<CommandCategory, string> = {
  system: "System",
  navigation: "Navigation",
  product: "Products",
  ai: "AI",
  workspace: "Workspace",
  settings: "Settings",
  developer: "Developer",
};
