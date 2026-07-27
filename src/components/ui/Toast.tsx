"use client";

import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { Toast as ToastPrimitive } from "radix-ui";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { INTERACTION_CONFIG } from "@/lib/config/app";
import { cn } from "@/lib/utils/cn";
import { formatErrorForUser } from "@/lib/errors/formatter";

import { IconButton } from "./Button";
import { toneTextStyles, type Tone } from "./variants";

/**
 * Transient notifications.
 *
 * Built on Radix Toast, which provides the swipe gesture, the hotkey that
 * focuses the toast region (F8), and — importantly — pausing the dismiss timer
 * while the pointer is over a toast or the window is blurred, so a message
 * cannot expire while the user is reading it.
 */

/** Tone of a toast, driving its icon and accent colour. */
export type ToastTone = Extract<Tone, "neutral" | "success" | "warning" | "danger" | "info">;

/** A queued toast. */
export interface ToastItem {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly tone: ToastTone;
  readonly durationMs: number;
  readonly action?: { readonly label: string; readonly onClick: () => void };
}

/** Options accepted when raising a toast. */
export interface ToastOptions {
  readonly description?: string;
  readonly tone?: ToastTone;
  /** Milliseconds before auto-dismiss. Pass `Infinity` to require a manual close. */
  readonly durationMs?: number;
  readonly action?: { readonly label: string; readonly onClick: () => void };
}

/** The toast API exposed through context. */
export interface ToastApi {
  /** Raises a toast and returns its identifier. */
  readonly toast: (title: string, options?: ToastOptions) => string;
  /** Raises a success toast. */
  readonly success: (title: string, options?: Omit<ToastOptions, "tone">) => string;
  /** Raises an error toast, formatting a caught value when given one. */
  readonly error: (titleOrError: string | unknown, options?: Omit<ToastOptions, "tone">) => string;
  /** Raises a warning toast. */
  readonly warning: (title: string, options?: Omit<ToastOptions, "tone">) => string;
  /** Raises an informational toast. */
  readonly info: (title: string, options?: Omit<ToastOptions, "tone">) => string;
  /** Dismisses a toast early. */
  readonly dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

/**
 * Accesses the toast API.
 *
 * @returns The toast API.
 * @throws {Error} When used outside a {@link ToastProvider}.
 */
export function useToast(): ToastApi {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider.");
  }

  return context;
}

/** Icon per tone. */
const TONE_ICONS: Record<ToastTone, React.ReactNode> = {
  neutral: <Info />,
  info: <Info />,
  success: <CheckCircle2 />,
  warning: <AlertTriangle />,
  danger: <XCircle />,
};

let toastCounter = 0;

/** Props for {@link ToastProvider}. */
export interface ToastProviderProps {
  readonly children: React.ReactNode;
  /** Where toasts appear. Defaults to bottom-right. */
  readonly position?: "top-right" | "top-center" | "bottom-right" | "bottom-center";
  /** Maximum toasts shown at once. Older ones are dropped. Defaults to 4. */
  readonly limit?: number;
}

const POSITION_STYLES: Record<NonNullable<ToastProviderProps["position"]>, string> = {
  "top-right": "top-0 end-0 flex-col",
  "top-center": "top-0 start-1/2 -translate-x-1/2 flex-col",
  "bottom-right": "bottom-0 end-0 flex-col-reverse",
  "bottom-center": "bottom-0 start-1/2 -translate-x-1/2 flex-col-reverse",
};

/**
 * Provides the toast API and renders the toast viewport.
 *
 * Mount once, near the root of the application.
 *
 * @param props - Children, position, and queue limit.
 * @returns The provider with its viewport.
 *
 * @example
 * const { success, error } = useToast();
 * success("Saved", { description: "Your changes are live." });
 */
export function ToastProvider({
  children,
  position = "bottom-right",
  limit = 4,
}: ToastProviderProps): React.JSX.Element {
  const [items, setItems] = useState<readonly ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (title: string, options: ToastOptions = {}): string => {
      toastCounter += 1;
      const id = `toast-${toastCounter}`;

      const item: ToastItem = {
        id,
        title,
        description: options.description,
        tone: options.tone ?? "neutral",
        durationMs: options.durationMs ?? INTERACTION_CONFIG.toastDurationMs,
        action: options.action,
      };

      setItems((current) => [...current, item].slice(-limit));
      return id;
    },
    [limit],
  );

  const api = useMemo<ToastApi>(
    () => ({
      toast,
      dismiss,
      success: (title, options) => toast(title, { ...options, tone: "success" }),
      warning: (title, options) => toast(title, { ...options, tone: "warning" }),
      info: (title, options) => toast(title, { ...options, tone: "info" }),
      error: (titleOrError, options) => {
        if (typeof titleOrError === "string") {
          return toast(titleOrError, { ...options, tone: "danger" });
        }

        const formatted = formatErrorForUser(titleOrError);
        return toast(formatted.title, {
          ...options,
          description: options?.description ?? formatted.description,
          tone: "danger",
        });
      },
    }),
    [toast, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      <ToastPrimitive.Provider swipeDirection={position.includes("right") ? "right" : "up"}>
        {children}

        {items.map((item) => (
          <ToastPrimitive.Root
            key={item.id}
            duration={Number.isFinite(item.durationMs) ? item.durationMs : undefined}
            onOpenChange={(open) => {
              if (!open) dismiss(item.id);
            }}
            className={cn(
              "pointer-events-auto flex w-full items-start gap-3 rounded-panel border border-hairline",
              "bg-surface-overlay p-3.5 shadow-elevation-4",
              "data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-2 data-[state=open]:fade-in-0",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
              "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
              "data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform",
              "data-[swipe=end]:animate-out data-[swipe=end]:fade-out-0",
            )}
          >
            <span
              aria-hidden
              className={cn("mt-0.5 shrink-0 [&_svg]:size-4", toneTextStyles[item.tone])}
            >
              {TONE_ICONS[item.tone]}
            </span>

            <div className="min-w-0 flex-1 space-y-0.5">
              <ToastPrimitive.Title className="text-sm font-medium text-white">
                {item.title}
              </ToastPrimitive.Title>

              {item.description ? (
                <ToastPrimitive.Description className="text-xs leading-relaxed text-white/60">
                  {item.description}
                </ToastPrimitive.Description>
              ) : null}

              {item.action ? (
                <ToastPrimitive.Action
                  altText={item.action.label}
                  onClick={item.action.onClick}
                  className="mt-1.5 text-xs font-medium text-brand-400 underline-offset-4 hover:underline"
                >
                  {item.action.label}
                </ToastPrimitive.Action>
              ) : null}
            </div>

            <ToastPrimitive.Close asChild>
              <IconButton
                label="Dismiss notification"
                icon={<X />}
                variant="ghost"
                size="xs"
                className="-me-1 -mt-1 shrink-0"
              />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}

        <ToastPrimitive.Viewport
          className={cn(
            "pointer-events-none fixed z-70 flex max-h-screen w-full max-w-sm gap-2 p-4",
            POSITION_STYLES[position],
          )}
        />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}
