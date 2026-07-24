
/**
 * Aila Design System Core
 *
 * Shared design system for the Aila Ecosystem.
 * Provides design tokens, component primitives,
 * and styling utilities used across all products.
 */

export type DesignTokenType =
  | "color"
  | "spacing"
  | "typography"
  | "borderRadius"
  | "shadow"
  | "transition"
  | "zIndex";

export interface DesignToken {
  name: string;
  type: DesignTokenType;
  value: string;
  description?: string;
}

export interface DesignPalette {
  name: string;
  colors: Record<string, string>;
}

export interface DesignTypography {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
}

export interface DesignSystem {
  name: string;
  version: string;
  palette: DesignPalette;
  typography: Record<string, DesignTypography>;
  tokens: DesignToken[];
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
  transitions: Record<string, string>;
  zIndex: Record<string, number>;
}

export const DESIGN_TOKEN_TYPES: DesignTokenType[] = [
  "color",
  "spacing",
  "typography",
  "borderRadius",
  "shadow",
  "transition",
  "zIndex",
];

export const AILA_DESIGN_SYSTEM: DesignSystem = {
  name: "Aila Design System",
  version: "1.0.0",
  palette: {
    name: "Aila Luxury",
    colors: {
      primary: "#00F2FF",
      secondary: "#D4AF37",
      background: "#020202",
      surface: "#080808",
      text: "#FFFFFF",
      textSecondary: "#A3A3A3",
      border: "#1A1A1A",
      success: "#4ADE80",
      warning: "#FACC15",
      error: "#F87171",
    },
  },
  typography: {
    heading: {
      fontFamily: "Inter, sans-serif",
      fontSize: "2.5rem",
      fontWeight: "700",
      lineHeight: "1.2",
      letterSpacing: "-0.02em",
    },
    body: {
      fontFamily: "Inter, sans-serif",
      fontSize: "1rem",
      fontWeight: "400",
      lineHeight: "1.6",
      letterSpacing: "0",
    },
    caption: {
      fontFamily: "Inter, sans-serif",
      fontSize: "0.75rem",
      fontWeight: "500",
      lineHeight: "1.4",
      letterSpacing: "0.02em",
    },
  },
  tokens: [],
  borderRadius: {
    sm: "0.25rem",
    md: "0.5rem",
    lg: "1rem",
    xl: "1.5rem",
    full: "9999px",
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  },
  transitions: {
    fast: "150ms ease-in-out",
    normal: "300ms ease-in-out",
    slow: "500ms ease-in-out",
  },
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    modal: 1300,
    toast: 1400,
    tooltip: 1500,
  },
};

export function getDesignToken(name: string): DesignToken | undefined {
  return AILA_DESIGN_SYSTEM.tokens.find((t) => t.name === name);
}

export function getDesignColor(path: string): string | undefined {
  const parts = path.split(".");
  let current: unknown = AILA_DESIGN_SYSTEM.palette.colors;

  for (const part of parts) {
    if (typeof current === "object" && current !== null && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return typeof current === "string" ? current : undefined;
}
