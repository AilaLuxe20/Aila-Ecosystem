"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { forwardRef } from "react";

import { cn } from "@/lib/utils/cn";
import { formatCompact, formatPercent } from "@/lib/utils/format";

import { Skeleton } from "./Skeleton";
import { cva, focusRing, type VariantProps } from "./variants";

const cardVariants = cva("rounded-panel transition-shadow duration-normal ease-standard", {
  variants: {
    variant: {
      solid: "border border-hairline bg-surface",
      glass: "glass",
      outline: "border border-hairline bg-transparent",
      raised: "border border-hairline bg-surface-raised shadow-elevation-2",
    },
    padding: {
      none: "p-0",
      sm: "p-3",
      md: "p-5",
      lg: "p-7",
    },
    interactive: {
      true: `cursor-pointer hover:border-hairline-strong hover:shadow-elevation-3 ${focusRing}`,
      false: "",
    },
  },
  defaultVariants: { variant: "solid", padding: "md", interactive: false },
});

/** Props for {@link Card}. */
export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /** Renders the card as an `article` for standalone content. */
  readonly as?: "div" | "article" | "section";
}

/**
 * A surface that groups related content.
 *
 * When `interactive` is set the card becomes focusable and is given a button
 * role, so a clickable card is reachable by keyboard rather than being a mouse-
 * only target.
 *
 * @param props - Variant, padding, interactivity, and div attributes.
 * @returns The card element.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, variant, padding, interactive, as: Component = "div", ...props },
  ref,
) {
  return (
    <Component
      ref={ref}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? "button" : undefined}
      className={cn(cardVariants({ variant, padding, interactive }), className)}
      {...props}
    />
  );
});

/**
 * The header region of a card.
 *
 * @param props - Div attributes.
 * @returns The card header.
 */
export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardHeader({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn("flex items-start justify-between gap-4 pb-4", className)}
        {...props}
      />
    );
  },
);

/**
 * The title of a card, rendered as a heading.
 *
 * @param props - Heading attributes.
 * @returns The card title.
 */
export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  function CardTitle({ className, ...props }, ref) {
    return (
      <h3
        ref={ref}
        className={cn("text-sm font-semibold tracking-tight text-white", className)}
        {...props}
      />
    );
  },
);

/**
 * Supporting text beneath a card title.
 *
 * @param props - Paragraph attributes.
 * @returns The card description.
 */
export const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(function CardDescription({ className, ...props }, ref) {
  return <p ref={ref} className={cn("text-xs text-white/50", className)} {...props} />;
});

/**
 * The main content region of a card.
 *
 * @param props - Div attributes.
 * @returns The card content.
 */
export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardContent({ className, ...props }, ref) {
    return <div ref={ref} className={cn("text-sm text-white/75", className)} {...props} />;
  },
);

/**
 * The footer region of a card, separated by a hairline.
 *
 * @param props - Div attributes.
 * @returns The card footer.
 */
export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardFooter({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn("mt-4 flex items-center gap-2 border-t border-hairline pt-4", className)}
        {...props}
      />
    );
  },
);

/** Direction of a metric's movement. */
export type TrendDirection = "up" | "down" | "flat";

/** Props for {@link StatisticCard}. */
export interface StatisticCardProps extends Omit<CardProps, "children"> {
  /** What the metric measures. */
  readonly label: string;
  /** The metric itself. Numbers are abbreviated automatically. */
  readonly value: number | string;
  /** Additional context shown beneath the value. */
  readonly hint?: string;
  /** Period-over-period change as a fraction, where `0.12` renders as `+12%`. */
  readonly change?: number;
  /**
   * Whether an increase is good. Set false for metrics such as churn, where a
   * rise should read as negative.
   */
  readonly increaseIsPositive?: boolean;
  /** Icon rendered in the top-right corner. */
  readonly icon?: React.ReactNode;
  /** Replaces the content with a placeholder. */
  readonly loading?: boolean;
}

/**
 * A card presenting a single metric with an optional trend.
 *
 * The trend's colour is derived from `increaseIsPositive` rather than from the
 * sign of the change, because "up" is not universally good — rising error rates
 * or churn should read as a regression.
 *
 * @param props - Label, value, change, and card attributes.
 * @returns The statistic card.
 *
 * @example
 * <StatisticCard label="Active users" value={12480} change={0.082} />
 * <StatisticCard label="Churn" value="2.4%" change={0.03} increaseIsPositive={false} />
 */
export const StatisticCard = forwardRef<HTMLDivElement, StatisticCardProps>(
  function StatisticCard(
    {
      label,
      value,
      hint,
      change,
      increaseIsPositive = true,
      icon,
      loading = false,
      className,
      ...props
    },
    ref,
  ) {
    const direction: TrendDirection =
      change === undefined || change === 0 ? "flat" : change > 0 ? "up" : "down";

    const isPositive = direction === "flat" ? null : (direction === "up") === increaseIsPositive;

    return (
      <Card ref={ref} className={cn("relative", className)} {...props}>
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-medium tracking-wide text-white/50 uppercase">{label}</p>
          {icon ? <span className="text-white/30 [&_svg]:size-4">{icon}</span> : null}
        </div>

        {loading ? (
          <div className="mt-3 space-y-2">
            <Skeleton shape="title" className="w-24" />
            <Skeleton shape="text" className="w-16" />
          </div>
        ) : (
          <>
            <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-white">
              {typeof value === "number" ? formatCompact(value) : value}
            </p>

            <div className="mt-1.5 flex items-center gap-2">
              {change !== undefined ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-xs font-medium tabular-nums",
                    isPositive === null && "text-white/45",
                    isPositive === true && "text-success",
                    isPositive === false && "text-danger",
                  )}
                >
                  {direction === "up" ? (
                    <TrendingUp aria-hidden className="size-3.5" />
                  ) : direction === "down" ? (
                    <TrendingDown aria-hidden className="size-3.5" />
                  ) : null}
                  {formatPercent(Math.abs(change), 1)}
                </span>
              ) : null}

              {hint ? <span className="text-xs text-white/40">{hint}</span> : null}
            </div>
          </>
        )}
      </Card>
    );
  },
);

export { cardVariants };
