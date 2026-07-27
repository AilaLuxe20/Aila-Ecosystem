"use client";

import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { forwardRef, useEffect } from "react";

import { cn } from "@/lib/utils/cn";
import { useHotkeys } from "@/hooks/use-keyboard";

import { DialogOverlay } from "./Dialog";

/**
 * Command palette primitives.
 *
 * Built on `cmdk`, which supplies fuzzy scoring, keyboard traversal that skips
 * group headings, and correct combobox ARIA — all of which are laborious to get
 * right by hand and easy to get subtly wrong.
 */

/**
 * The command root. Use directly for an inline command surface, or
 * {@link CommandDialog} for the overlay form.
 */
export const Command = forwardRef<
  React.ComponentRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(function Command({ className, ...props }, ref) {
  return (
    <CommandPrimitive
      ref={ref}
      className={cn(
        "flex size-full flex-col overflow-hidden rounded-panel bg-surface-overlay text-white",
        className,
      )}
      {...props}
    />
  );
});

/**
 * The search field.
 *
 * @param props - Input attributes.
 * @returns The command input with its search icon.
 */
export const CommandInput = forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(function CommandInput({ className, ...props }, ref) {
  return (
    <div className="flex items-center gap-2.5 border-b border-hairline px-3">
      <Search aria-hidden className="size-4 shrink-0 text-white/35" />

      <CommandPrimitive.Input
        ref={ref}
        className={cn(
          "h-11 w-full bg-transparent text-sm text-white outline-none",
          "placeholder:text-white/30 disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  );
});

/**
 * The scrollable results region.
 *
 * @param props - List attributes.
 * @returns The command list element.
 */
export const CommandList = forwardRef<
  React.ComponentRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(function CommandList({ className, ...props }, ref) {
  return (
    <CommandPrimitive.List
      ref={ref}
      className={cn("max-h-80 overflow-y-auto overflow-x-hidden p-1.5", className)}
      {...props}
    />
  );
});

/**
 * Rendered when no item matches the query.
 *
 * @param props - Empty state attributes.
 * @returns The empty element.
 */
export const CommandEmpty = forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>(function CommandEmpty({ className, ...props }, ref) {
  return (
    <CommandPrimitive.Empty
      ref={ref}
      className={cn("py-8 text-center text-xs text-white/40", className)}
      {...props}
    />
  );
});

/**
 * A titled group of commands.
 *
 * The heading is hidden automatically when every item in the group is filtered
 * out, which avoids stranded headings during a search.
 *
 * @param props - Group attributes, including `heading`.
 * @returns The command group element.
 */
export const CommandGroup = forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(function CommandGroup({ className, ...props }, ref) {
  return (
    <CommandPrimitive.Group
      ref={ref}
      className={cn(
        "overflow-hidden text-white",
        "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5",
        "[&_[cmdk-group-heading]]:text-2xs [&_[cmdk-group-heading]]:font-medium",
        "[&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide",
        "[&_[cmdk-group-heading]]:text-white/35",
        className,
      )}
      {...props}
    />
  );
});

/**
 * A dividing line between command groups.
 *
 * @param props - Separator attributes.
 * @returns The separator element.
 */
export const CommandSeparator = forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(function CommandSeparator({ className, ...props }, ref) {
  return (
    <CommandPrimitive.Separator
      ref={ref}
      className={cn("-mx-1.5 my-1.5 h-px bg-hairline", className)}
      {...props}
    />
  );
});

/** Props for {@link CommandItem}. */
export interface CommandItemProps
  extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item> {
  /** Icon rendered before the label. */
  readonly icon?: React.ReactNode;
  /** Keyboard shortcut hint rendered at the end of the row. */
  readonly shortcut?: string;
  /** Supporting text rendered beneath the label. */
  readonly description?: string;
}

/**
 * A selectable command.
 *
 * @param props - Icon, shortcut, description, and item attributes.
 * @returns The command item element.
 */
export const CommandItem = forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Item>,
  CommandItemProps
>(function CommandItem({ className, icon, shortcut, description, children, ...props }, ref) {
  return (
    <CommandPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2.5 rounded-[0.375rem] px-2 py-2",
        "text-sm text-white/80 outline-none transition-colors duration-instant",
        "data-[selected=true]:bg-surface-raised data-[selected=true]:text-white",
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-40",
        "[&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    >
      {icon ? <span className="text-white/45">{icon}</span> : null}

      <span className="min-w-0 flex-1">
        <span className="block truncate">{children}</span>
        {description ? (
          <span className="block truncate text-2xs text-white/35">{description}</span>
        ) : null}
      </span>

      {shortcut ? (
        <span className="ms-auto shrink-0 text-2xs tracking-widest text-white/30">{shortcut}</span>
      ) : null}
    </CommandPrimitive.Item>
  );
});

/** Props for {@link CommandDialog}. */
export interface CommandDialogProps {
  /** Whether the palette is visible. */
  readonly open: boolean;
  /** Called when the palette requests to open or close. */
  readonly onOpenChange: (open: boolean) => void;
  /** Placeholder for the search field. */
  readonly placeholder?: string;
  /** Accessible title. Visually hidden but required for the dialog. */
  readonly title?: string;
  /** Command groups and items. */
  readonly children: React.ReactNode;
  /**
   * Keyboard shortcut that opens the palette. Defaults to `"mod+k"`.
   * Pass `null` to disable the binding.
   */
  readonly shortcut?: string | null;
}

/**
 * A command palette presented as a modal overlay.
 *
 * Binds its own open shortcut so callers do not have to wire it up, and closes
 * on selection by default.
 *
 * @param props - Open state, placeholder, shortcut, and command content.
 * @returns The command dialog.
 *
 * @example
 * const [open, setOpen] = useState(false);
 * <CommandDialog open={open} onOpenChange={setOpen}>
 *   <CommandGroup heading="Navigation">
 *     <CommandItem onSelect={() => router.push("/settings")}>Settings</CommandItem>
 *   </CommandGroup>
 * </CommandDialog>
 */
export function CommandDialog({
  open,
  onOpenChange,
  placeholder = "Type a command or search…",
  title = "Command palette",
  children,
  shortcut = "mod+k",
}: CommandDialogProps): React.JSX.Element {
  useHotkeys(
    shortcut ?? "",
    () => onOpenChange(!open),
    { enabled: shortcut !== null, enableInFormFields: true },
  );

  // Closing on route change is the caller's concern, but resetting scroll
  // position when reopening is not — cmdk keeps the previous query otherwise.
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      document.querySelector<HTMLInputElement>("[cmdk-input]")?.focus();
    }, 0);
    return () => clearTimeout(timer);
  }, [open]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogOverlay />

        <DialogPrimitive.Content
          className={cn(
            "fixed start-1/2 top-[15%] z-50 w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2",
            "overflow-hidden rounded-modal border border-hairline bg-surface-overlay shadow-elevation-5",
            "focus:outline-none",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          )}
        >
          <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Search for a command or navigate the application.
          </DialogPrimitive.Description>

          <Command>
            <CommandInput placeholder={placeholder} />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              {children}
            </CommandList>
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
