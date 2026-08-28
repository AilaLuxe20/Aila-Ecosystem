import { cn } from "@/lib/utils/cn";

import { cva, type VariantProps } from "./variants";

const skeletonVariants = cva("skeleton-fill", {
  variants: {
    shape: {
      text: "h-4 rounded",
      title: "h-6 rounded",
      circle: "rounded-full",
      rect: "rounded-panel",
    },
  },
  defaultVariants: { shape: "text" },
});

/** Props for {@link Skeleton}. */
export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

/**
 * A shimmering placeholder shown while content loads.
 *
 * Marked `aria-hidden` and paired with a `sr-only` status message by
 * {@link SkeletonText}, so assistive technology hears "loading" once rather
 * than announcing a wall of empty boxes.
 *
 * @param props - Shape and div attributes.
 * @returns The skeleton element.
 */
export function Skeleton({ className, shape, ...props }: SkeletonProps): React.JSX.Element {
  return (
    <div aria-hidden className={cn(skeletonVariants({ shape }), className)} {...props} />
  );
}

/** Props for {@link SkeletonText}. */
export interface SkeletonTextProps extends React.HTMLAttributes<HTMLDivElement> {
  /** How many lines to render. Defaults to 3. */
  readonly lines?: number;
  /** Accessible message announced while loading. */
  readonly label?: string;
}

/**
 * A multi-line text placeholder.
 *
 * The final line is rendered short, which reads as a paragraph rather than a
 * block and makes the placeholder less visually rigid.
 *
 * @param props - Line count, accessible label, and div attributes.
 * @returns The skeleton text block.
 */
export function SkeletonText({
  lines = 3,
  label = "Loading content",
  className,
  ...props
}: SkeletonTextProps): React.JSX.Element {
  return (
    <div role="status" className={cn("space-y-2", className)} {...props}>
      <span className="sr-only">{label}</span>

      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          shape="text"
          className={index === lines - 1 && lines > 1 ? "w-3/5" : "w-full"}
        />
      ))}
    </div>
  );
}

export { skeletonVariants };
