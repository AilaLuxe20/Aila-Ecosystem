"use client";

import { ChevronRight } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { cn } from "@/lib/utils/cn";
import { useControllableState } from "@/hooks/use-controllable-state";

import { focusRing } from "./variants";

/**
 * Hierarchical tree navigation.
 *
 * Implements the WAI-ARIA tree pattern: the tree is a single tab stop, and
 * arrow keys move focus, expand, and collapse. Managing focus with a roving
 * `tabIndex` — rather than making every node tabbable — is what keeps a deep
 * tree from trapping keyboard users in dozens of tab stops.
 */

/** A node in a {@link TreeView}. */
export interface TreeNode {
  /** Stable identifier. */
  readonly id: string;
  /** Visible text. */
  readonly label: string;
  /** Icon rendered before the label. */
  readonly icon?: React.ReactNode;
  /** Child nodes. An empty array marks an expandable but currently empty node. */
  readonly children?: readonly TreeNode[];
  /** Prevents selection and expansion. */
  readonly disabled?: boolean;
  /** Content rendered at the end of the row, such as a count. */
  readonly meta?: React.ReactNode;
}

/** Props for {@link TreeView}. */
export interface TreeViewProps
  extends Omit<React.HTMLAttributes<HTMLUListElement>, "onSelect"> {
  /** Root nodes. */
  readonly nodes: readonly TreeNode[];
  /** Controlled set of expanded node IDs. */
  readonly expandedIds?: ReadonlySet<string>;
  /** Initially expanded node IDs when uncontrolled. */
  readonly defaultExpandedIds?: readonly string[];
  /** Called when a node expands or collapses. */
  readonly onExpandedChange?: (ids: ReadonlySet<string>) => void;
  /** Controlled selected node ID. */
  readonly selectedId?: string | null;
  /** Called when a node is selected. */
  readonly onSelect?: (node: TreeNode) => void;
  /** Accessible name for the tree. */
  readonly label: string;
}

/**
 * Flattens the currently visible nodes into traversal order.
 *
 * Keyboard navigation moves through what is on screen, not the full tree, so
 * collapsed subtrees must be excluded.
 *
 * @param nodes - Root nodes.
 * @param expanded - Currently expanded node IDs.
 * @param depth - Current depth, used internally.
 * @returns Visible nodes paired with their depth.
 */
function flattenVisible(
  nodes: readonly TreeNode[],
  expanded: ReadonlySet<string>,
  depth = 0,
): Array<{ node: TreeNode; depth: number }> {
  return nodes.flatMap((node) => {
    const entry = { node, depth };
    const hasChildren = Boolean(node.children && node.children.length > 0);

    return hasChildren && expanded.has(node.id)
      ? [entry, ...flattenVisible(node.children ?? [], expanded, depth + 1)]
      : [entry];
  });
}

/**
 * A collapsible tree of nodes.
 *
 * @param props - Nodes, expansion and selection state, and list attributes.
 * @returns The tree element.
 *
 * @example
 * <TreeView label="Files" nodes={fileTree} onSelect={(node) => open(node.id)} />
 */
export function TreeView({
  nodes,
  expandedIds,
  defaultExpandedIds = [],
  onExpandedChange,
  selectedId,
  onSelect,
  label,
  className,
  ...props
}: TreeViewProps): React.JSX.Element {
  const [expanded, setExpanded] = useControllableState<ReadonlySet<string>>({
    value: expandedIds,
    defaultValue: useMemo(() => new Set(defaultExpandedIds), [defaultExpandedIds]),
    onChange: onExpandedChange,
  });

  const visible = useMemo(() => flattenVisible(nodes, expanded), [nodes, expanded]);
  const [focusedId, setFocusedId] = useState<string | null>(visible[0]?.node.id ?? null);

  const toggle = useCallback(
    (id: string) => {
      const next = new Set(expanded);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setExpanded(next);
    },
    [expanded, setExpanded],
  );

  const moveFocus = useCallback(
    (offset: number) => {
      const currentIndex = visible.findIndex((entry) => entry.node.id === focusedId);
      const nextIndex = Math.min(Math.max(currentIndex + offset, 0), visible.length - 1);
      const next = visible[nextIndex];
      if (next) setFocusedId(next.node.id);
    },
    [visible, focusedId],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLUListElement>) => {
      const entry = visible.find((candidate) => candidate.node.id === focusedId);
      if (!entry) return;

      const { node } = entry;
      const hasChildren = Boolean(node.children && node.children.length > 0);
      const isExpanded = expanded.has(node.id);

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          moveFocus(1);
          break;
        case "ArrowUp":
          event.preventDefault();
          moveFocus(-1);
          break;
        case "ArrowRight":
          event.preventDefault();
          if (hasChildren && !isExpanded) toggle(node.id);
          else if (hasChildren) moveFocus(1);
          break;
        case "ArrowLeft":
          event.preventDefault();
          if (hasChildren && isExpanded) toggle(node.id);
          else moveFocus(-1);
          break;
        case "Home":
          event.preventDefault();
          setFocusedId(visible[0]?.node.id ?? null);
          break;
        case "End":
          event.preventDefault();
          setFocusedId(visible[visible.length - 1]?.node.id ?? null);
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          if (node.disabled) break;
          if (hasChildren) toggle(node.id);
          onSelect?.(node);
          break;
        default:
          break;
      }
    },
    [visible, focusedId, expanded, moveFocus, toggle, onSelect],
  );

  return (
    <ul
      role="tree"
      aria-label={label}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={cn("space-y-0.5 rounded-control", focusRing, className)}
      {...props}
    >
      {visible.map(({ node, depth }) => {
        const hasChildren = Boolean(node.children && node.children.length > 0);
        const isExpanded = expanded.has(node.id);
        const isSelected = node.id === selectedId;
        const isFocused = node.id === focusedId;

        return (
          <li
            key={node.id}
            role="treeitem"
            aria-expanded={hasChildren ? isExpanded : undefined}
            aria-selected={isSelected}
            aria-level={depth + 1}
            aria-disabled={node.disabled}
          >
            <div
              onClick={() => {
                if (node.disabled) return;
                setFocusedId(node.id);
                if (hasChildren) toggle(node.id);
                onSelect?.(node);
              }}
              style={{ paddingInlineStart: `${depth * 1.125 + 0.5}rem` }}
              className={cn(
                "flex cursor-pointer items-center gap-1.5 rounded-control py-1.5 pe-2 text-sm",
                "transition-colors duration-instant",
                isSelected
                  ? "bg-brand-500/12 text-brand-200"
                  : "text-white/70 hover:bg-surface-raised hover:text-white",
                isFocused && !isSelected && "bg-surface-raised/60",
                node.disabled && "pointer-events-none opacity-40",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "grid size-4 shrink-0 place-items-center text-white/35 transition-transform duration-fast",
                  hasChildren && isExpanded && "rotate-90",
                  !hasChildren && "invisible",
                )}
              >
                <ChevronRight className="size-3.5 rtl:rotate-180" />
              </span>

              {node.icon ? (
                <span aria-hidden className="shrink-0 text-white/45 [&_svg]:size-4">
                  {node.icon}
                </span>
              ) : null}

              <span className="min-w-0 flex-1 truncate">{node.label}</span>

              {node.meta ? <span className="shrink-0 text-2xs text-white/35">{node.meta}</span> : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
