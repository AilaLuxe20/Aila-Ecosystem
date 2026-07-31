"use client";

import { GripVertical } from "lucide-react";
import { Group, Panel, Separator, useDefaultLayout } from "react-resizable-panels";

import { STORAGE_KEYS } from "@/lib/config/app";
import { cn } from "@/lib/utils/cn";

import { focusRing } from "@/components/ui/variants";

/**
 * Resizable panel layouts.
 *
 * `react-resizable-panels` v4 handles the pointer maths, keyboard resizing, and
 * `aria-valuenow` reporting on the separator.
 *
 * Layout persistence goes through the library's `useDefaultLayout` hook rather
 * than being read from storage during render. The hook returns the stored
 * layout as `defaultLayout`, which avoids the layout shift that a
 * read-after-mount approach would cause on every page load.
 */

/** Props for {@link PanelLayout}. */
export interface PanelLayoutProps {
  /** Stable ID under which the layout is persisted. */
  readonly id: string;
  /** Split direction. Defaults to horizontal. */
  readonly orientation?: "horizontal" | "vertical";
  /** {@link ResizablePanel} elements interleaved with {@link PanelHandle}. */
  readonly children: React.ReactNode;
  readonly className?: string;
}

/**
 * A group of resizable panels with a persisted layout.
 *
 * @param props - Persistence ID, orientation, and panel children.
 * @returns The panel group element.
 *
 * @example
 * <PanelLayout id="inbox">
 *   <ResizablePanel defaultSize="30" minSize="20">{list}</ResizablePanel>
 *   <PanelHandle />
 *   <ResizablePanel>{detail}</ResizablePanel>
 * </PanelLayout>
 */
export function PanelLayout({
  id,
  orientation = "horizontal",
  children,
  className,
}: PanelLayoutProps): React.JSX.Element {
  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: `${STORAGE_KEYS.panelLayoutPrefix}${id}`,
    onlySaveAfterUserInteractions: true,
  });

  return (
    <Group
      id={id}
      orientation={orientation}
      defaultLayout={defaultLayout}
      onLayoutChanged={onLayoutChanged}
      className={cn("size-full", className)}
    >
      {children}
    </Group>
  );
}

/** Props for {@link ResizablePanel}. */
export type ResizablePanelProps = React.ComponentPropsWithoutRef<typeof Panel>;

/**
 * A single resizable region within a {@link PanelLayout}.
 *
 * Sizes without an explicit unit are interpreted as percentages; numbers are
 * interpreted as pixels.
 *
 * @param props - Panel attributes such as `defaultSize`, `minSize`, `collapsible`.
 * @returns The panel element.
 */
export function ResizablePanel({
  className,
  ...props
}: ResizablePanelProps): React.JSX.Element {
  return <Panel className={cn("min-w-0 overflow-hidden", className)} {...props} />;
}

/** Props for {@link PanelHandle}. */
export interface PanelHandleProps {
  /** Renders a visible grip affordance. */
  readonly withGrip?: boolean;
  readonly className?: string;
}

/**
 * The draggable separator between two panels.
 *
 * The hit area is deliberately wider than the visible line: a one-pixel target
 * is close to unusable with a mouse and impossible with touch.
 *
 * @param props - Grip visibility and classes.
 * @returns The separator element.
 */
export function PanelHandle({ withGrip = false, className }: PanelHandleProps): React.JSX.Element {
  return (
    <Separator
      className={cn(
        "group relative flex items-center justify-center",
        "data-[orientation=horizontal]:w-1.5 data-[orientation=vertical]:h-1.5",
        "transition-colors duration-fast",
        focusRing,
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "bg-hairline transition-colors duration-fast group-hover:bg-brand-500/60",
          "group-data-[orientation=horizontal]:h-full group-data-[orientation=horizontal]:w-px",
          "group-data-[orientation=vertical]:h-px group-data-[orientation=vertical]:w-full",
        )}
      />

      {withGrip ? (
        <span
          aria-hidden
          className="absolute grid size-4 place-items-center rounded border border-hairline bg-surface-raised text-white/40"
        >
          <GripVertical className="size-3" />
        </span>
      ) : null}
    </Separator>
  );
}

/** Props for {@link SplitView}. */
export interface SplitViewProps {
  /** Stable ID under which the layout is persisted. */
  readonly id: string;
  /** Content of the first panel. */
  readonly primary: React.ReactNode;
  /** Content of the second panel. */
  readonly secondary: React.ReactNode;
  /** Initial size of the first panel, as a percentage. Defaults to 40. */
  readonly defaultSize?: number;
  /** Minimum size of the first panel, as a percentage. Defaults to 20. */
  readonly minSize?: number;
  /** Split direction. Defaults to horizontal. */
  readonly orientation?: "horizontal" | "vertical";
  /** Renders only the secondary panel, for narrow viewports. */
  readonly collapsed?: boolean;
  readonly className?: string;
}

/**
 * A two-pane split with a persisted divider position.
 *
 * The common list-and-detail layout, packaged so it is not reassembled from
 * primitives on every screen.
 *
 * @param props - Panel content, sizing, and orientation.
 * @returns The split view element.
 */
export function SplitView({
  id,
  primary,
  secondary,
  defaultSize = 40,
  minSize = 20,
  orientation = "horizontal",
  collapsed = false,
  className,
}: SplitViewProps): React.JSX.Element {
  if (collapsed) {
    return <div className={cn("size-full min-w-0", className)}>{secondary}</div>;
  }

  return (
    <PanelLayout id={id} orientation={orientation} className={className}>
      <ResizablePanel defaultSize={`${defaultSize}%`} minSize={`${minSize}%`}>
        {primary}
      </ResizablePanel>

      <PanelHandle />

      <ResizablePanel minSize="30%">{secondary}</ResizablePanel>
    </PanelLayout>
  );
}
