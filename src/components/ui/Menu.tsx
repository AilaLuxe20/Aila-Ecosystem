"use client";

import { Check, ChevronRight, Circle } from "lucide-react";
import { ContextMenu as ContextMenuPrimitive, DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import { forwardRef } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * Dropdown and context menus.
 *
 * The two primitives have identical anatomy, so their styling is defined once
 * here and applied to both. Radix supplies typeahead, roving focus, submenu
 * timing, and pointer-vs-keyboard distinction.
 */

/** Surface treatment shared by both menu families. */
const menuSurface = [
  "z-50 min-w-[10rem] overflow-hidden rounded-panel border border-hairline",
  "bg-surface-overlay p-1 shadow-elevation-4",
  "data-[state=open]:animate-in data-[state=closed]:animate-out",
  "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
  "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
].join(" ");

/** Row treatment shared by every menu item variant. */
const menuItem = [
  "relative flex cursor-pointer select-none items-center gap-2 rounded-[0.375rem]",
  "px-2 py-1.5 text-sm text-white/80 outline-none",
  "transition-colors duration-instant",
  "focus:bg-surface-raised focus:text-white",
  "data-[highlighted]:bg-surface-raised data-[highlighted]:text-white",
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
  "[&_svg]:size-4 [&_svg]:shrink-0",
].join(" ");

const menuLabel = "px-2 py-1.5 text-2xs font-medium uppercase tracking-wide text-white/35";
const menuSeparator = "-mx-1 my-1 h-px bg-hairline";
const menuShortcut = "ms-auto ps-4 text-2xs tracking-widest text-white/35";

/* -------------------------------------------------------------------------
 * Dropdown menu
 * ---------------------------------------------------------------------- */

/** The dropdown menu root, owning open state. */
export const DropdownMenu = DropdownMenuPrimitive.Root;

/** Element that toggles the dropdown menu. */
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

/** Groups related items for assistive technology. */
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;

/** Groups mutually exclusive radio items. */
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

/** A nested submenu. */
export const DropdownMenuSub = DropdownMenuPrimitive.Sub;

/**
 * The dropdown menu surface.
 *
 * @param props - Alignment, offset, and menu content attributes.
 * @returns The menu content, portalled to the document body.
 */
export const DropdownMenuContent = forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(function DropdownMenuContent({ className, sideOffset = 6, align = "start", ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        align={align}
        collisionPadding={8}
        className={cn(menuSurface, className)}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
});

/** Props for {@link DropdownMenuItem}. */
export interface DropdownMenuItemProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> {
  /** Applies destructive styling to the row. */
  readonly destructive?: boolean;
  /** Icon rendered before the label. */
  readonly icon?: React.ReactNode;
  /** Keyboard shortcut hint rendered at the end of the row. */
  readonly shortcut?: string;
}

/**
 * A selectable row in a dropdown menu.
 *
 * @param props - Icon, shortcut, destructive flag, and item attributes.
 * @returns The menu item.
 */
export const DropdownMenuItem = forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Item>,
  DropdownMenuItemProps
>(function DropdownMenuItem({ className, destructive, icon, shortcut, children, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={cn(
        menuItem,
        destructive && "text-danger focus:bg-danger/12 focus:text-danger data-[highlighted]:bg-danger/12 data-[highlighted]:text-danger",
        className,
      )}
      {...props}
    >
      {icon}
      {children}
      {shortcut ? <span className={menuShortcut}>{shortcut}</span> : null}
    </DropdownMenuPrimitive.Item>
  );
});

/**
 * A dropdown menu item with a checked state.
 *
 * @param props - Checkbox item attributes.
 * @returns The checkbox item.
 */
export const DropdownMenuCheckboxItem = forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(function DropdownMenuCheckboxItem({ className, children, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      ref={ref}
      className={cn(menuItem, "ps-7", className)}
      {...props}
    >
      <span className="absolute start-2 grid place-items-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Check aria-hidden className="size-3.5" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
});

/**
 * A dropdown menu item within a radio group.
 *
 * @param props - Radio item attributes.
 * @returns The radio item.
 */
export const DropdownMenuRadioItem = forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(function DropdownMenuRadioItem({ className, children, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.RadioItem
      ref={ref}
      className={cn(menuItem, "ps-7", className)}
      {...props}
    >
      <span className="absolute start-2 grid place-items-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Circle aria-hidden className="size-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
});

/**
 * A non-interactive heading within a dropdown menu.
 *
 * @param props - Label attributes.
 * @returns The label element.
 */
export const DropdownMenuLabel = forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>
>(function DropdownMenuLabel({ className, ...props }, ref) {
  return <DropdownMenuPrimitive.Label ref={ref} className={cn(menuLabel, className)} {...props} />;
});

/**
 * A dividing line between menu groups.
 *
 * @param props - Separator attributes.
 * @returns The separator element.
 */
export const DropdownMenuSeparator = forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(function DropdownMenuSeparator({ className, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Separator ref={ref} className={cn(menuSeparator, className)} {...props} />
  );
});

/**
 * The row that opens a submenu.
 *
 * @param props - Sub-trigger attributes.
 * @returns The sub-trigger element.
 */
export const DropdownMenuSubTrigger = forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger>
>(function DropdownMenuSubTrigger({ className, children, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      ref={ref}
      className={cn(menuItem, "data-[state=open]:bg-surface-raised", className)}
      {...props}
    >
      {children}
      <ChevronRight aria-hidden className="ms-auto size-3.5 opacity-50 rtl:rotate-180" />
    </DropdownMenuPrimitive.SubTrigger>
  );
});

/**
 * The surface of a submenu.
 *
 * @param props - Sub-content attributes.
 * @returns The submenu content.
 */
export const DropdownMenuSubContent = forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(function DropdownMenuSubContent({ className, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.SubContent
        ref={ref}
        className={cn(menuSurface, className)}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
});

/* -------------------------------------------------------------------------
 * Context menu
 * ---------------------------------------------------------------------- */

/** The context menu root. */
export const ContextMenu = ContextMenuPrimitive.Root;

/** The region that opens the menu on right-click or long press. */
export const ContextMenuTrigger = ContextMenuPrimitive.Trigger;

/** Groups related context menu items. */
export const ContextMenuGroup = ContextMenuPrimitive.Group;

/** A nested context submenu. */
export const ContextMenuSub = ContextMenuPrimitive.Sub;

/**
 * The context menu surface.
 *
 * @param props - Context menu content attributes.
 * @returns The menu content, portalled to the document body.
 */
export const ContextMenuContent = forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
>(function ContextMenuContent({ className, ...props }, ref) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        ref={ref}
        collisionPadding={8}
        className={cn(menuSurface, className)}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  );
});

/** Props for {@link ContextMenuItem}. */
export interface ContextMenuItemProps
  extends React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> {
  /** Applies destructive styling to the row. */
  readonly destructive?: boolean;
  /** Icon rendered before the label. */
  readonly icon?: React.ReactNode;
  /** Keyboard shortcut hint rendered at the end of the row. */
  readonly shortcut?: string;
}

/**
 * A selectable row in a context menu.
 *
 * @param props - Icon, shortcut, destructive flag, and item attributes.
 * @returns The menu item.
 */
export const ContextMenuItem = forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.Item>,
  ContextMenuItemProps
>(function ContextMenuItem({ className, destructive, icon, shortcut, children, ...props }, ref) {
  return (
    <ContextMenuPrimitive.Item
      ref={ref}
      className={cn(
        menuItem,
        destructive && "text-danger data-[highlighted]:bg-danger/12 data-[highlighted]:text-danger",
        className,
      )}
      {...props}
    >
      {icon}
      {children}
      {shortcut ? <span className={menuShortcut}>{shortcut}</span> : null}
    </ContextMenuPrimitive.Item>
  );
});

/**
 * A non-interactive heading within a context menu.
 *
 * @param props - Label attributes.
 * @returns The label element.
 */
export const ContextMenuLabel = forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label>
>(function ContextMenuLabel({ className, ...props }, ref) {
  return <ContextMenuPrimitive.Label ref={ref} className={cn(menuLabel, className)} {...props} />;
});

/**
 * A dividing line between context menu groups.
 *
 * @param props - Separator attributes.
 * @returns The separator element.
 */
export const ContextMenuSeparator = forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>
>(function ContextMenuSeparator({ className, ...props }, ref) {
  return (
    <ContextMenuPrimitive.Separator ref={ref} className={cn(menuSeparator, className)} {...props} />
  );
});

export { menuItem, menuLabel, menuSeparator, menuShortcut, menuSurface };
