
/**
 * Aila Widgets Core
 *
 * Widget system for the Aila Ecosystem.
 * Provides widget definition, registration, and
 * dashboard composition capabilities.
 */

export type WidgetSize = "sm" | "md" | "lg" | "xl" | "full";

export type WidgetCategory =
  | "analytics"
  | "monitoring"
  | "control"
  | "display"
  | "input"
  | "navigation"
  | "ai";

export interface WidgetDefinition {
  id: string;
  name: string;
  description: string;
  productId: string;
  category: WidgetCategory;
  size: WidgetSize;
  component: string;
  props?: Record<string, unknown>;
  permissions?: string[];
  refreshInterval?: number;
}

export interface WidgetInstance {
  id: string;
  definitionId: string;
  dashboardId: string;
  position: { x: number; y: number; w: number; h: number };
  props?: Record<string, unknown>;
}

export interface WidgetDashboard {
  id: string;
  productId: string;
  name: string;
  description: string;
  widgets: WidgetInstance[];
  layout: string;
  createdAt: Date;
  updatedAt: Date;
}

export const WIDGET_CATEGORIES: WidgetCategory[] = [
  "analytics",
  "monitoring",
  "control",
  "display",
  "input",
  "navigation",
  "ai",
];

export const WIDGET_SIZES: WidgetSize[] = ["sm", "md", "lg", "xl", "full"];

export function createWidgetDefinition(
  def: Partial<WidgetDefinition> & Pick<WidgetDefinition, "id" | "name" | "productId">
): WidgetDefinition {
  return {
    description: "",
    category: "display",
    size: "md",
    component: "WidgetPlaceholder",
    ...def,
  };
}
