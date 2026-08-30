"use client";

import { Slot } from "radix-ui";
import { forwardRef } from "react";

import { cn } from "@/lib/utils/cn";

import { Spinner } from "./Spinner";
import {
  controlSizeStyles,
  cva,
  disabledStyles,
  focusRing,
  glyphSizeStyles,
  iconSizeStyles,
  type ControlSize,
  type VariantProps,
} from "./variants";

/**
 * Visual treatments available to buttons.
 *
 * `destructive` is separate from a `danger` tone because a destructive action
 * needs to be unmistakable, not merely tinted.
 */
const buttonVariants = cva(
  [
    "relative inline-flex select-none items-center justify-center whitespace-nowrap",
    "rounded-control font-medium",
    "transition-[background-color,border-color,color,box-shadow,transform] duration-fast ease-standard",
    "active:scale-[0.98]",
    focusRing,
    disabledStyles,
  ].join(" "),
  {
    variants: {
      variant: {
        primary: "bg-brand-500 text-brand-950 shadow-elevation-1 hover:bg-brand-400",
        secondary:
          "border border-hairline bg-surface-raised text-white hover:border-hairline-strong hover:bg-surface-overlay",
        outline:
          "border border-hairline-strong bg-transparent text-white hover:bg-surface-raised",
        ghost: "bg-transparent text-white/75 hover:bg-surface-raised hover:text-white",
        link: "bg-transparent text-brand-400 underline-offset-4 hover:underline",
        destructive: "bg-danger text-white shadow-elevation-1 hover:bg-danger/90",
      },
      size: {
        xs: controlSizeStyles.xs,
        sm: controlSizeStyles.sm,
        md: controlSizeStyles.md,
        lg: controlSizeStyles.lg,
      },
      fullWidth: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "primary", size: "md", fullWidth: false },
  },
);

/** Props for {@link Button}. */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Renders the child element instead of a `button`, forwarding all styling.
   * Use for links that should look like buttons.
   */
  readonly asChild?: boolean;
  /** Shows a spinner and blocks interaction. */
  readonly loading?: boolean;
  /** Replaces the label while loading. */
  readonly loadingText?: string;
  /** Element rendered before the label. */
  readonly leadingIcon?: React.ReactNode;
  /** Element rendered after the label. */
  readonly trailingIcon?: React.ReactNode;
}

/**
 * The primary action control.
 *
 * While `loading`, the button is disabled and marked `aria-busy`, and the label
 * is preserved at its original width so surrounding layout does not shift.
 *
 * @param props - Variant, size, loading state, icons, and button attributes.
 * @returns The button element.
 *
 * @example
 * <Button variant="primary" leadingIcon={<Plus />}>Create</Button>
 * <Button asChild variant="link"><Link href="/docs">Docs</Link></Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant,
    size = "md",
    fullWidth,
    asChild = false,
    loading = false,
    loadingText,
    leadingIcon,
    trailingIcon,
    disabled,
    children,
    type = "button",
    ...props
  },
  ref,
) {
  const resolvedSize: ControlSize = size ?? "md";
  const classNames = cn(
    buttonVariants({ variant, size, fullWidth }),
    glyphSizeStyles[resolvedSize],
    className,
  );

  if (asChild) {
    return (
      <Slot.Root
        ref={ref}
        aria-busy={loading || undefined}
        aria-disabled={disabled || loading || undefined}
        className={classNames}
        {...props}
      >
        {children}
      </Slot.Root>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={classNames}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size={resolvedSize} label="" aria-hidden />
          {loadingText ?? children}
        </>
      ) : (
        <>
          {leadingIcon}
          {children}
          {trailingIcon}
        </>
      )}
    </button>
  );
});

/** Props for {@link IconButton}. */
export interface IconButtonProps extends Omit<ButtonProps, "leadingIcon" | "trailingIcon"> {
  /** Accessible name. Required, because the button has no visible text. */
  readonly label: string;
  /** The icon to render. */
  readonly icon: React.ReactNode;
}

/**
 * A square button containing only an icon.
 *
 * `label` is mandatory and becomes the accessible name — an icon alone conveys
 * nothing to a screen reader.
 *
 * @param props - Label, icon, variant, size, and button attributes.
 * @returns The icon button element.
 *
 * @example
 * <IconButton label="Close" icon={<X />} variant="ghost" />
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, icon, size = "md", className, loading, ...props },
  ref,
) {
  const resolvedSize: ControlSize = size ?? "md";

  return (
    <Button
      ref={ref}
      aria-label={label}
      size={size}
      loading={loading}
      className={cn("shrink-0 p-0", iconSizeStyles[resolvedSize], className)}
      {...props}
    >
      {loading ? null : icon}
    </Button>
  );
});

export { buttonVariants };
