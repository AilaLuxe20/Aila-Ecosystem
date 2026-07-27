import { cn } from "@/lib/utils/cn";

import type { ControlSize } from "./variants";

/** Props for {@link Spinner}. */
export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  /** Diameter of the spinner. Defaults to `"md"`. */
  readonly size?: ControlSize;
  /** Accessible label announced to screen readers. */
  readonly label?: string;
}

const SPINNER_SIZES: Record<ControlSize, string> = {
  xs: "size-3",
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
};

/**
 * An indeterminate loading indicator.
 *
 * Rendered as an SVG rather than a bordered element so it stays crisp at any
 * size and inherits `currentColor` from its parent.
 *
 * @param props - Size, accessible label, and SVG attributes.
 * @returns The spinner element.
 */
export function Spinner({
  size = "md",
  label = "Loading",
  className,
  ...props
}: SpinnerProps): React.JSX.Element {
  return (
    <svg
      role="status"
      aria-label={label}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("animate-spin text-current", SPINNER_SIZES[size], className)}
      {...props}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
