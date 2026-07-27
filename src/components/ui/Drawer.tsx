"use client";

import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { forwardRef } from "react";

import { cn } from "@/lib/utils/cn";

import { IconButton } from "./Button";
import { DialogOverlay } from "./Dialog";
import { cva, type VariantProps } from "./variants";

/**
 * Edge-anchored panels.
 *
 * Implemented on Radix Dialog rather than a bespoke component so a drawer gets
 * the same focus trap, scroll lock, and dismissal semantics as a modal — a
 * drawer is a modal that happens to be anchored to an edge.
 */

const drawerVariants = cva(
  [
    "fixed z-50 flex flex-col border-hairline bg-surface-overlay shadow-elevation-5",
    "focus:outline-none",
    "data-[state=open]:animate-in data-[state=closed]:animate-out duration-normal",
  ].join(" "),
  {
    variants: {
      side: {
        left: "inset-y-0 start-0 h-full border-e data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
        right:
          "inset-y-0 end-0 h-full border-s data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
        top: "inset-x-0 top-0 w-full border-b data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top",
        bottom:
          "inset-x-0 bottom-0 w-full border-t data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
      },
      size: {
        sm: "",
        md: "",
        lg: "",
        full: "",
      },
    },
    compoundVariants: [
      { side: ["left", "right"], size: "sm", class: "w-72 max-w-[85vw]" },
      { side: ["left", "right"], size: "md", class: "w-96 max-w-[85vw]" },
      { side: ["left", "right"], size: "lg", class: "w-[32rem] max-w-[90vw]" },
      { side: ["left", "right"], size: "full", class: "w-screen" },
      { side: ["top", "bottom"], size: "sm", class: "h-40 max-h-[85dvh]" },
      { side: ["top", "bottom"], size: "md", class: "h-80 max-h-[85dvh]" },
      { side: ["top", "bottom"], size: "lg", class: "h-[32rem] max-h-[90dvh]" },
      { side: ["top", "bottom"], size: "full", class: "h-dvh" },
    ],
    defaultVariants: { side: "right", size: "md" },
  },
);

/** The drawer root, owning open state. */
export const Drawer = DialogPrimitive.Root;

/** Element that opens the drawer. */
export const DrawerTrigger = DialogPrimitive.Trigger;

/** Element that closes the drawer. */
export const DrawerClose = DialogPrimitive.Close;

/** Props for {@link DrawerContent}. */
export interface DrawerContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof drawerVariants> {
  /** Hides the built-in close button. */
  readonly hideCloseButton?: boolean;
}

/**
 * The drawer surface.
 *
 * @param props - Side, size, close-button visibility, and content attributes.
 * @returns The drawer content, portalled to the document body.
 *
 * @example
 * <Drawer>
 *   <DrawerTrigger asChild><Button>Filters</Button></DrawerTrigger>
 *   <DrawerContent side="right" size="md">
 *     <DrawerHeader><DrawerTitle>Filters</DrawerTitle></DrawerHeader>
 *     <DrawerBody>…</DrawerBody>
 *   </DrawerContent>
 * </Drawer>
 */
export const DrawerContent = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  DrawerContentProps
>(function DrawerContent({ className, children, side, size, hideCloseButton = false, ...props }, ref) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />

      <DialogPrimitive.Content
        ref={ref}
        className={cn(drawerVariants({ side, size }), className)}
        {...props}
      >
        {children}

        {hideCloseButton ? null : (
          <DialogPrimitive.Close asChild>
            <IconButton
              label="Close panel"
              icon={<X />}
              variant="ghost"
              size="sm"
              className="absolute end-3 top-3"
            />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});

/**
 * The drawer header region.
 *
 * @param props - Div attributes.
 * @returns The header element.
 */
export function DrawerHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      className={cn("shrink-0 space-y-1 border-b border-hairline px-5 py-4 pe-14", className)}
      {...props}
    />
  );
}

/**
 * The drawer title. Required — it provides the accessible name.
 *
 * @param props - Title attributes.
 * @returns The title element.
 */
export const DrawerTitle = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(function DrawerTitle({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn("text-sm font-semibold tracking-tight text-white", className)}
      {...props}
    />
  );
});

/**
 * Supporting text beneath the drawer title.
 *
 * @param props - Description attributes.
 * @returns The description element.
 */
export const DrawerDescription = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(function DrawerDescription({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn("text-xs leading-relaxed text-white/55", className)}
      {...props}
    />
  );
});

/**
 * The scrollable body of a drawer.
 *
 * @param props - Div attributes.
 * @returns The body element.
 */
export function DrawerBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      className={cn("min-h-0 flex-1 overflow-y-auto px-5 py-4 text-sm text-white/80", className)}
      {...props}
    />
  );
}

/**
 * The drawer footer, where actions live.
 *
 * @param props - Div attributes.
 * @returns The footer element.
 */
export function DrawerFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-end gap-2 border-t border-hairline px-5 py-4",
        className,
      )}
      {...props}
    />
  );
}

export { drawerVariants };
