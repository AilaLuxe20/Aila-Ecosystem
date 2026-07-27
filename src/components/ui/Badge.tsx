"use client";

import { X } from "lucide-react";
import { forwardRef } from "react";

import { cn } from "@/lib/utils/cn";

import {
  cva,
  focusRing,
  toneSolidStyles,
  toneSurfaceStyles,
  type Tone,
  type VariantProps,
} from "./variants";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border font-medium whitespace-nowrap",
  {
    variants: {
      size: {
        sm: "h-5 px-2 text-2xs [&_svg]:size-3",
        md: "h-6 px-2.5 text-xs [&_svg]:size-3.5",
        lg: "h-7 px-3 text-sm [&_svg]:size-4",
      },
    },
    defaultVariants: { size: "md" },
  },
);

/** Props for {@link Badge}. */
export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Semantic colour. Defaults to `"neutral"`. */
  readonly tone?: Tone;
  /** Solid fill instead of a tinted surface. */
  readonly solid?: boolean;
  /** Shows a filled dot before the label. */
  readonly dot?: boolean;
}

/**
 * A compact, non-interactive status label.
 *
 * When `dot` is set the indicator is marked `aria-hidden` — colour alone must
 * never be the only carrier of meaning, so the text label remains the source of
 * truth.
 *
 * @param props - Tone, size, fill style, and span attributes.
 * @returns The badge element.
 *
 * @example
 * <Badge tone="success" dot>Active</Badge>
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, tone = "neutral", solid = false, dot = false, size, children, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cn(
        badgeVariants({ size }),
        solid ? `${toneSolidStyles[tone]} border-transparent` : toneSurfaceStyles[tone],
        className,
      )}
      {...props}
    >
      {dot ? <span aria-hidden className="size-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
});

/** Props for {@link Chip}. */
export interface ChipProps extends Omit<BadgeProps, "dot"> {
  /** Renders a remove control and receives the dismiss event. */
  readonly onRemove?: () => void;
  /** Accessible label for the remove control. */
  readonly removeLabel?: string;
  /** Marks the chip as selected. */
  readonly selected?: boolean;
  /** Makes the whole chip activatable. */
  readonly onSelect?: () => void;
}

/**
 * An interactive badge, used for filters and multi-select values.
 *
 * The remove control is a real nested `button`, so it is reachable by keyboard
 * independently of the chip itself.
 *
 * @param props - Tone, selection state, removal handler, and span attributes.
 * @returns The chip element.
 *
 * @example
 * <Chip tone="brand" onRemove={() => remove(tag)}>{tag}</Chip>
 */
export const Chip = forwardRef<HTMLSpanElement, ChipProps>(function Chip(
  {
    className,
    tone = "neutral",
    solid = false,
    selected = false,
    size = "md",
    onRemove,
    onSelect,
    removeLabel,
    children,
    ...props
  },
  ref,
) {
  const interactive = Boolean(onSelect);

  return (
    <span
      ref={ref}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-pressed={interactive ? selected : undefined}
      onClick={onSelect}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect?.();
              }
            }
          : undefined
      }
      className={cn(
        badgeVariants({ size }),
        solid ? `${toneSolidStyles[tone]} border-transparent` : toneSurfaceStyles[tone],
        interactive && `cursor-pointer transition-colors duration-fast ${focusRing}`,
        selected && "ring-1 ring-brand-400",
        onRemove && "pe-1",
        className,
      )}
      {...props}
    >
      {children}

      {onRemove ? (
        <button
          type="button"
          aria-label={removeLabel ?? `Remove ${typeof children === "string" ? children : "item"}`}
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          className={cn(
            "ms-0.5 grid size-4 place-items-center rounded-full",
            "opacity-60 transition-opacity duration-fast hover:opacity-100",
            focusRing,
          )}
        >
          <X aria-hidden className="size-3" />
        </button>
      ) : null}
    </span>
  );
});

/**
 * A label for taxonomy, rendered with square corners to read as metadata
 * rather than as status.
 *
 * @param props - Tone, size, and span attributes.
 * @returns The tag element.
 */
export const Tag = forwardRef<HTMLSpanElement, BadgeProps>(function Tag(
  { className, ...props },
  ref,
) {
  return <Badge ref={ref} className={cn("rounded-control", className)} {...props} />;
});

export { badgeVariants };
