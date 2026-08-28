"use client";

import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { forwardRef } from "react";

import { cn } from "@/lib/utils/cn";

import { IconButton } from "./Button";
import { toneSurfaceStyles, toneTextStyles, type Tone } from "./variants";

/** Default icon per tone. */
const TONE_ICONS: Record<Tone, React.ReactNode> = {
  neutral: <Info />,
  brand: <Info />,
  info: <Info />,
  success: <CheckCircle2 />,
  warning: <AlertTriangle />,
  danger: <XCircle />,
};

/**
 * ARIA live behaviour per tone.
 *
 * Errors interrupt with `assertive`; everything else waits for a pause so the
 * user is not cut off mid-sentence for an informational message.
 */
const TONE_ROLE: Record<Tone, { role: "alert" | "status"; live: "assertive" | "polite" }> = {
  neutral: { role: "status", live: "polite" },
  brand: { role: "status", live: "polite" },
  info: { role: "status", live: "polite" },
  success: { role: "status", live: "polite" },
  warning: { role: "alert", live: "polite" },
  danger: { role: "alert", live: "assertive" },
};

/** Props for {@link Alert}. */
export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Semantic tone. Defaults to `"info"`. */
  readonly tone?: Tone;
  /** Heading text. */
  readonly title?: React.ReactNode;
  /** Replaces the default tone icon. Pass `null` to remove it. */
  readonly icon?: React.ReactNode | null;
  /** Renders a dismiss control and receives the event. */
  readonly onDismiss?: () => void;
  /** Actions rendered beneath the body. */
  readonly actions?: React.ReactNode;
}

/**
 * An inline message conveying status or the result of an action.
 *
 * @param props - Tone, title, icon, actions, and div attributes.
 * @returns The alert element.
 *
 * @example
 * <Alert tone="danger" title="Payment failed">Your card was declined.</Alert>
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { className, tone = "info", title, icon, onDismiss, actions, children, ...props },
  ref,
) {
  const { role, live } = TONE_ROLE[tone];
  const resolvedIcon = icon === null ? null : (icon ?? TONE_ICONS[tone]);

  return (
    <div
      ref={ref}
      role={role}
      aria-live={live}
      className={cn(
        "flex gap-3 rounded-panel border p-3.5",
        toneSurfaceStyles[tone],
        className,
      )}
      {...props}
    >
      {resolvedIcon ? (
        <span aria-hidden className={cn("mt-0.5 shrink-0 [&_svg]:size-4", toneTextStyles[tone])}>
          {resolvedIcon}
        </span>
      ) : null}

      <div className="min-w-0 flex-1 space-y-1">
        {title ? <p className="text-sm font-medium text-white">{title}</p> : null}
        {children ? <div className="text-xs leading-relaxed text-white/70">{children}</div> : null}
        {actions ? <div className="flex flex-wrap gap-2 pt-1.5">{actions}</div> : null}
      </div>

      {onDismiss ? (
        <IconButton
          label="Dismiss"
          icon={<X />}
          variant="ghost"
          size="xs"
          onClick={onDismiss}
          className="-me-1 -mt-1 shrink-0"
        />
      ) : null}
    </div>
  );
});

/** Props for {@link Banner}. */
export interface BannerProps extends AlertProps {
  /** Pins the banner to the top of its scroll container. */
  readonly sticky?: boolean;
}

/**
 * A full-width message spanning the top of a page or region.
 *
 * Differs from {@link Alert} in placement rather than semantics: a banner
 * addresses the whole page, an alert addresses the section it sits in.
 *
 * @param props - Sticky flag plus alert attributes.
 * @returns The banner element.
 */
export const Banner = forwardRef<HTMLDivElement, BannerProps>(function Banner(
  { className, sticky = false, ...props },
  ref,
) {
  return (
    <Alert
      ref={ref}
      className={cn(
        "rounded-none border-x-0 border-t-0 px-4 py-3",
        sticky && "sticky top-0 z-20",
        className,
      )}
      {...props}
    />
  );
});
