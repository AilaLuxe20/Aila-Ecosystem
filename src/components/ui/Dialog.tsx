"use client";

import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { forwardRef } from "react";

import { cn } from "@/lib/utils/cn";

import { IconButton } from "./Button";
import { cva, type VariantProps } from "./variants";

/**
 * Modal dialogs.
 *
 * Built on Radix Dialog, which supplies focus trapping, focus restoration on
 * close, scroll locking, and `Escape` handling. Those are the parts a hand-
 * rolled modal reliably gets wrong.
 */

const dialogContentVariants = cva(
  [
    "fixed start-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
    "flex max-h-[85dvh] w-[calc(100vw-2rem)] flex-col",
    "rounded-modal border border-hairline bg-surface-overlay shadow-elevation-5",
    "focus:outline-none",
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
    "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-2xl",
        full: "max-w-[calc(100vw-4rem)]",
      },
    },
    defaultVariants: { size: "md" },
  },
);

/** The dialog root, owning open state. */
export const Dialog = DialogPrimitive.Root;

/** Element that opens the dialog. Use `asChild` to wrap a custom control. */
export const DialogTrigger = DialogPrimitive.Trigger;

/** Element that closes the dialog. Use `asChild` to wrap a custom control. */
export const DialogClose = DialogPrimitive.Close;

/** Renders the dialog outside the DOM hierarchy of its parent. */
export const DialogPortal = DialogPrimitive.Portal;

/**
 * The dimmed backdrop behind a dialog.
 *
 * @param props - Overlay attributes.
 * @returns The overlay element.
 */
export const DialogOverlay = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(function DialogOverlay({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        "fixed inset-0 z-40 bg-black/65 backdrop-blur-sm",
        "data-[state=open]:animate-in data-[state=open]:fade-in-0",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        className,
      )}
      {...props}
    />
  );
});

/** Props for {@link DialogContent}. */
export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof dialogContentVariants> {
  /** Hides the built-in close button. */
  readonly hideCloseButton?: boolean;
}

/**
 * The dialog surface, including its overlay and close control.
 *
 * @param props - Size, close-button visibility, and content attributes.
 * @returns The dialog content, portalled to the document body.
 *
 * @example
 * <Dialog>
 *   <DialogTrigger asChild><Button>Open</Button></DialogTrigger>
 *   <DialogContent size="lg">
 *     <DialogHeader><DialogTitle>Settings</DialogTitle></DialogHeader>
 *     <DialogBody>…</DialogBody>
 *   </DialogContent>
 * </Dialog>
 */
export const DialogContent = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(function DialogContent({ className, children, size, hideCloseButton = false, ...props }, ref) {
  return (
    <DialogPortal>
      <DialogOverlay />

      <DialogPrimitive.Content
        ref={ref}
        className={cn(dialogContentVariants({ size }), className)}
        {...props}
      >
        {children}

        {hideCloseButton ? null : (
          <DialogPrimitive.Close asChild>
            <IconButton
              label="Close dialog"
              icon={<X />}
              variant="ghost"
              size="sm"
              className="absolute end-3 top-3"
            />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});

/**
 * The dialog header region.
 *
 * @param props - Div attributes.
 * @returns The header element.
 */
export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      className={cn("shrink-0 space-y-1 border-b border-hairline px-6 py-4 pe-14", className)}
      {...props}
    />
  );
}

/**
 * The dialog title. Required — Radix uses it as the accessible name.
 *
 * @param props - Title attributes.
 * @returns The title element.
 */
export const DialogTitle = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(function DialogTitle({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn("text-base font-semibold tracking-tight text-white", className)}
      {...props}
    />
  );
});

/**
 * Supporting text beneath the dialog title, wired to `aria-describedby`.
 *
 * @param props - Description attributes.
 * @returns The description element.
 */
export const DialogDescription = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(function DialogDescription({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn("text-xs leading-relaxed text-white/55", className)}
      {...props}
    />
  );
});

/**
 * The scrollable body of a dialog.
 *
 * Scrolling lives here rather than on the content so the header and footer stay
 * pinned while long content moves.
 *
 * @param props - Div attributes.
 * @returns The body element.
 */
export function DialogBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      className={cn("min-h-0 flex-1 overflow-y-auto px-6 py-5 text-sm text-white/80", className)}
      {...props}
    />
  );
}

/**
 * The dialog footer, where actions live.
 *
 * @param props - Div attributes.
 * @returns The footer element.
 */
export function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      className={cn(
        "flex shrink-0 flex-col-reverse gap-2 border-t border-hairline px-6 py-4 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

export { dialogContentVariants };
