"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

import { PAGINATION_CONFIG } from "@/lib/config/app";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/format";
import type { PaginationResult } from "@/hooks/use-pagination";

import { IconButton } from "./Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select";
import { focusRing } from "./variants";

/** Props for {@link Pagination}. */
export interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
  /** State from {@link usePagination}. */
  readonly pagination: PaginationResult;
  /** Total items, used for the summary text. */
  readonly totalItems: number;
  /** Renders a page-size selector. */
  readonly showPageSize?: boolean;
  /** Renders the "Showing x–y of z" summary. */
  readonly showSummary?: boolean;
  /** Renders first and last page controls. */
  readonly showEdgeButtons?: boolean;
  /** Word describing the items, used in the summary. */
  readonly itemLabel?: string;
}

/**
 * Page navigation for a paginated collection.
 *
 * Rendered as a `nav` with an accessible name, and the active page carries
 * `aria-current="page"` so a screen reader can report position without relying
 * on the visual highlight.
 *
 * @param props - Pagination state, totals, and nav attributes.
 * @returns The pagination control.
 *
 * @example
 * const pagination = usePagination({ totalItems: total });
 * <Pagination pagination={pagination} totalItems={total} showPageSize />
 */
export function Pagination({
  pagination,
  totalItems,
  showPageSize = false,
  showSummary = true,
  showEdgeButtons = false,
  itemLabel = "results",
  className,
  ...props
}: PaginationProps): React.JSX.Element {
  const {
    page,
    pageSize,
    pageCount,
    startIndex,
    endIndex,
    canPreviousPage,
    canNextPage,
    items,
    setPage,
    setPageSize,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
  } = pagination;

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex flex-wrap items-center justify-between gap-3", className)}
      {...props}
    >
      <div className="flex items-center gap-3">
        {showSummary ? (
          <p className="text-xs text-white/45 tabular-nums">
            {totalItems === 0
              ? `No ${itemLabel}`
              : `Showing ${formatNumber(startIndex + 1)}–${formatNumber(endIndex)} of ${formatNumber(totalItems)} ${itemLabel}`}
          </p>
        ) : null}

        {showPageSize ? (
          <Select
            value={String(pageSize)}
            onValueChange={(value) => setPageSize(Number(value))}
          >
            <SelectTrigger size="xs" className="w-auto gap-1.5" aria-label="Results per page">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {PAGINATION_CONFIG.pageSizeOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option} per page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
      </div>

      <div className="flex items-center gap-1">
        {showEdgeButtons ? (
          <IconButton
            label="First page"
            icon={<ChevronsLeft />}
            variant="ghost"
            size="sm"
            disabled={!canPreviousPage}
            onClick={firstPage}
          />
        ) : null}

        <IconButton
          label="Previous page"
          icon={<ChevronLeft />}
          variant="ghost"
          size="sm"
          disabled={!canPreviousPage}
          onClick={previousPage}
        />

        <ul className="flex items-center gap-1">
          {items.map((item, index) =>
            item === "ellipsis" ? (
              <li
                key={`ellipsis-${index}`}
                aria-hidden
                className="grid size-8 place-items-center text-xs text-white/30"
              >
                …
              </li>
            ) : (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => setPage(item)}
                  aria-current={item === page ? "page" : undefined}
                  aria-label={`Page ${item}`}
                  className={cn(
                    "grid size-8 place-items-center rounded-control text-xs tabular-nums",
                    "transition-colors duration-fast",
                    item === page
                      ? "bg-brand-500 font-medium text-brand-950"
                      : "text-white/60 hover:bg-surface-raised hover:text-white",
                    focusRing,
                  )}
                >
                  {item}
                </button>
              </li>
            ),
          )}
        </ul>

        <IconButton
          label="Next page"
          icon={<ChevronRight />}
          variant="ghost"
          size="sm"
          disabled={!canNextPage}
          onClick={nextPage}
        />

        {showEdgeButtons ? (
          <IconButton
            label="Last page"
            icon={<ChevronsRight />}
            variant="ghost"
            size="sm"
            disabled={!canNextPage}
            onClick={lastPage}
          />
        ) : null}
      </div>

      <span className="sr-only" aria-live="polite">
        Page {page} of {pageCount}
      </span>
    </nav>
  );
}
