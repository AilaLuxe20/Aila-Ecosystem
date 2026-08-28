import { cva, type VariantProps } from "class-variance-authority";

/**
 * Shared variant vocabulary for the design system.
 *
 * Sizes, tones, and the focus ring are defined once here so every control
 * agrees on what `size="sm"` means and no component invents its own scale.
 */

/** Size scale shared by interactive controls. */
export const CONTROL_SIZES = ["xs", "sm", "md", "lg"] as const;

/** A control size. */
export type ControlSize = (typeof CONTROL_SIZES)[number];

/** Semantic tone shared by badges, alerts, and status indicators. */
export const TONES = ["neutral", "brand", "success", "warning", "danger", "info"] as const;

/** A semantic tone. */
export type Tone = (typeof TONES)[number];

/**
 * Focus ring applied to every focusable control.
 *
 * Uses `focus-visible` so a mouse click does not draw a ring, while keyboard
 * and assistive-technology focus always does.
 */
export const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

/** Disabled treatment shared by every control. */
export const disabledStyles =
  "disabled:pointer-events-none disabled:opacity-50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50";

/** Height, padding, and text size per control size. */
export const controlSizeStyles: Record<ControlSize, string> = {
  xs: "h-7 px-2 text-2xs gap-1",
  sm: "h-8 px-2.5 text-xs gap-1.5",
  md: "h-9 px-3.5 text-sm gap-2",
  lg: "h-11 px-5 text-base gap-2",
};

/** Square dimensions per control size, for icon-only controls. */
export const iconSizeStyles: Record<ControlSize, string> = {
  xs: "size-7",
  sm: "size-8",
  md: "size-9",
  lg: "size-11",
};

/** Icon glyph dimensions matched to each control size. */
export const glyphSizeStyles: Record<ControlSize, string> = {
  xs: "[&_svg]:size-3",
  sm: "[&_svg]:size-3.5",
  md: "[&_svg]:size-4",
  lg: "[&_svg]:size-5",
};

/** Background, text, and border treatment per tone, for subtle surfaces. */
export const toneSurfaceStyles: Record<Tone, string> = {
  neutral: "bg-surface-raised text-white/80 border-hairline",
  brand: "bg-brand-500/12 text-brand-300 border-brand-500/25",
  success: "bg-success/12 text-success border-success/25",
  warning: "bg-warning/12 text-warning border-warning/25",
  danger: "bg-danger/12 text-danger border-danger/25",
  info: "bg-info/12 text-info border-info/25",
};

/** Solid fill treatment per tone. */
export const toneSolidStyles: Record<Tone, string> = {
  neutral: "bg-surface-overlay text-white",
  brand: "bg-brand-500 text-brand-950",
  success: "bg-success text-black/85",
  warning: "bg-warning text-black/85",
  danger: "bg-danger text-white",
  info: "bg-info text-black/85",
};

/** Foreground colour per tone, for icons and text. */
export const toneTextStyles: Record<Tone, string> = {
  neutral: "text-white/70",
  brand: "text-brand-400",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  info: "text-info",
};

/**
 * Base treatment for text-entry controls: inputs, textareas, and select
 * triggers. Shared so they remain visually indistinguishable when adjacent.
 */
export const fieldBase = cva(
  [
    "w-full rounded-control border bg-surface-sunken text-white",
    "placeholder:text-white/30",
    "transition-[border-color,box-shadow,background-color] duration-fast ease-standard",
    focusRing,
    disabledStyles,
  ].join(" "),
  {
    variants: {
      size: {
        xs: "h-7 px-2 text-2xs",
        sm: "h-8 px-2.5 text-xs",
        md: "h-9 px-3 text-sm",
        lg: "h-11 px-4 text-base",
      },
      invalid: {
        true: "border-danger/60 focus-visible:ring-danger",
        false: "border-hairline hover:border-hairline-strong",
      },
    },
    defaultVariants: { size: "md", invalid: false },
  },
);

/** Props accepted by {@link fieldBase}. */
export type FieldVariantProps = VariantProps<typeof fieldBase>;

export { cva, type VariantProps };
