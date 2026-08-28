"use client";

import { Avatar as AvatarPrimitive } from "radix-ui";
import { forwardRef } from "react";

import { cn } from "@/lib/utils/cn";
import { initials as toInitials } from "@/lib/utils/string";

import { cva, type VariantProps } from "./variants";

const avatarVariants = cva(
  "relative inline-flex shrink-0 select-none overflow-hidden bg-surface-raised align-middle",
  {
    variants: {
      size: {
        xs: "size-6 text-2xs",
        sm: "size-8 text-xs",
        md: "size-10 text-sm",
        lg: "size-12 text-base",
        xl: "size-16 text-lg",
      },
      shape: {
        circle: "rounded-full",
        square: "rounded-panel",
      },
    },
    defaultVariants: { size: "md", shape: "circle" },
  },
);

/** Presence state shown as a corner indicator. */
export type PresenceStatus = "online" | "offline" | "busy" | "away";

const PRESENCE_STYLES: Record<PresenceStatus, string> = {
  online: "bg-success",
  offline: "bg-white/30",
  busy: "bg-danger",
  away: "bg-warning",
};

/** Props for {@link Avatar}. */
export interface AvatarProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof avatarVariants> {
  /** Image source. Falls back to initials when absent or failing to load. */
  readonly src?: string | null;
  /** Name used for the image alt text and to derive initials. */
  readonly name: string;
  /** Presence indicator rendered in the lower-right corner. */
  readonly status?: PresenceStatus;
}

/**
 * A user or entity avatar with an automatic initials fallback.
 *
 * Built on Radix Avatar, which only swaps in the fallback after the image
 * actually fails — this avoids the flash of initials that a naive `onError`
 * implementation produces on slow connections.
 *
 * @param props - Image source, name, size, shape, presence, and span attributes.
 * @returns The avatar element.
 *
 * @example
 * <Avatar name="Ada Lovelace" src={user.imageUrl} status="online" />
 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { className, src, name, size, shape, status, ...props },
  ref,
) {
  return (
    <span ref={ref} className={cn("relative inline-flex", className)} {...props}>
      <AvatarPrimitive.Root className={cn(avatarVariants({ size, shape }))}>
        {src ? (
          <AvatarPrimitive.Image
            src={src}
            alt={name}
            className="size-full object-cover"
          />
        ) : null}

        <AvatarPrimitive.Fallback
          delayMs={src ? 300 : 0}
          className="grid size-full place-items-center font-medium text-white/70"
        >
          {toInitials(name)}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>

      {status ? (
        <span
          role="status"
          aria-label={status}
          className={cn(
            "absolute end-0 bottom-0 size-2.5 rounded-full ring-2 ring-canvas",
            PRESENCE_STYLES[status],
          )}
        />
      ) : null}
    </span>
  );
});

/** Props for {@link AvatarGroup}. */
export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Avatars to display, in order. */
  readonly avatars: ReadonlyArray<{ name: string; src?: string | null }>;
  /** How many to show before collapsing into a count. Defaults to 4. */
  readonly max?: number;
  /** Size applied to every avatar. */
  readonly size?: AvatarProps["size"];
}

/**
 * Overlapping avatars with an overflow count.
 *
 * @param props - The avatar list, overflow limit, size, and div attributes.
 * @returns The avatar group element.
 */
export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(function AvatarGroup(
  { avatars, max = 4, size = "md", className, ...props },
  ref,
) {
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - visible.length;

  return (
    <div ref={ref} className={cn("flex items-center -space-x-2", className)} {...props}>
      {visible.map((avatar) => (
        <Avatar
          key={`${avatar.name}-${avatar.src ?? ""}`}
          name={avatar.name}
          src={avatar.src}
          size={size}
          className="ring-2 ring-canvas"
        />
      ))}

      {overflow > 0 ? (
        <span
          className={cn(
            avatarVariants({ size, shape: "circle" }),
            "grid place-items-center font-medium text-white/60 ring-2 ring-canvas",
          )}
        >
          +{overflow}
        </span>
      ) : null}
    </div>
  );
});

export { avatarVariants };
