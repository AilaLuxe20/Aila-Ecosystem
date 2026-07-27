"use client";

import { useCallback, useMemo } from "react";

import { PAGINATION_CONFIG } from "@/lib/config/app";
import { clamp } from "@/lib/utils/number";

import { useControllableState } from "./use-controllable-state";

/** An entry in a rendered pagination control. */
export type PaginationItem = number | "ellipsis";

/** Pagination state and its controls. */
export interface PaginationResult {
  /** Current one-based page. */
  readonly page: number;
  /** Items shown per page. */
  readonly pageSize: number;
  /** Total pages, at least 1. */
  readonly pageCount: number;
  /** Zero-based index of the first item on the page. */
  readonly startIndex: number;
  /** Exclusive zero-based index of the last item on the page. */
  readonly endIndex: number;
  readonly canPreviousPage: boolean;
  readonly canNextPage: boolean;
  readonly isFirstPage: boolean;
  readonly isLastPage: boolean;
  /** Page numbers and ellipses for rendering the control. */
  readonly items: readonly PaginationItem[];
  readonly setPage: (page: number) => void;
  readonly setPageSize: (size: number) => void;
  readonly nextPage: () => void;
  readonly previousPage: () => void;
  readonly firstPage: () => void;
  readonly lastPage: () => void;
}

/** Options for {@link usePagination}. */
export interface UsePaginationOptions {
  /** Total items across every page. */
  readonly totalItems: number;
  /** Controlled page. */
  readonly page?: number;
  /** Initial page when uncontrolled. Defaults to 1. */
  readonly defaultPage?: number;
  /** Controlled page size. */
  readonly pageSize?: number;
  /** Initial page size when uncontrolled. */
  readonly defaultPageSize?: number;
  /** Page numbers shown either side of the current page. Defaults to 1. */
  readonly siblingCount?: number;
  readonly onPageChange?: (page: number) => void;
  readonly onPageSizeChange?: (pageSize: number) => void;
}

/**
 * Builds the sequence of page numbers and ellipses for a pagination control.
 *
 * First and last pages are always present so the range is anchored; gaps
 * collapse to an ellipsis only when they span more than one page, which avoids
 * replacing a single number with a wider "…".
 *
 * @param page - Current one-based page.
 * @param pageCount - Total pages.
 * @param siblingCount - Pages shown either side of the current page.
 * @returns The items to render.
 */
export function buildPaginationItems(
  page: number,
  pageCount: number,
  siblingCount = 1,
): PaginationItem[] {
  // First, last, current, two ellipses, and the siblings on both sides.
  const maxVisible = siblingCount * 2 + 5;

  if (pageCount <= maxVisible) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const leftSibling = Math.max(page - siblingCount, 1);
  const rightSibling = Math.min(page + siblingCount, pageCount);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < pageCount - 1;

  const items: PaginationItem[] = [1];

  if (showLeftEllipsis) {
    items.push("ellipsis");
  } else {
    for (let value = 2; value < leftSibling; value += 1) items.push(value);
  }

  for (let value = Math.max(leftSibling, 2); value <= Math.min(rightSibling, pageCount - 1); value += 1) {
    items.push(value);
  }

  if (showRightEllipsis) {
    items.push("ellipsis");
  } else {
    for (let value = rightSibling + 1; value < pageCount; value += 1) items.push(value);
  }

  items.push(pageCount);
  return items;
}

/**
 * Manages pagination state, supporting controlled and uncontrolled usage.
 *
 * Changing the page size keeps the first visible item in view rather than
 * resetting to page one, so a user reviewing page 4 of 10 at 25 per page lands
 * near the same records when they switch to 50 per page.
 *
 * @param options - Total item count plus controlled or default state.
 * @returns Pagination state and controls.
 */
export function usePagination(options: UsePaginationOptions): PaginationResult {
  const {
    totalItems,
    page: controlledPage,
    defaultPage = 1,
    pageSize: controlledPageSize,
    defaultPageSize = PAGINATION_CONFIG.defaultPageSize,
    siblingCount = 1,
    onPageChange,
    onPageSizeChange,
  } = options;

  const [pageSize, setPageSizeState] = useControllableState({
    value: controlledPageSize,
    defaultValue: defaultPageSize,
    onChange: onPageSizeChange,
  });

  const pageCount = Math.max(1, Math.ceil(totalItems / Math.max(pageSize, 1)));

  const [rawPage, setPageState] = useControllableState({
    value: controlledPage,
    defaultValue: defaultPage,
    onChange: onPageChange,
  });

  const page = clamp(rawPage, 1, pageCount);

  const setPage = useCallback(
    (next: number) => setPageState(clamp(Math.trunc(next), 1, pageCount)),
    [setPageState, pageCount],
  );

  const setPageSize = useCallback(
    (nextSize: number) => {
      const size = clamp(Math.trunc(nextSize), 1, PAGINATION_CONFIG.maxPageSize);
      const firstVisibleItem = (page - 1) * pageSize;

      setPageSizeState(size);
      setPageState(Math.floor(firstVisibleItem / size) + 1);
    },
    [page, pageSize, setPageSizeState, setPageState],
  );

  const nextPage = useCallback(() => setPage(page + 1), [setPage, page]);
  const previousPage = useCallback(() => setPage(page - 1), [setPage, page]);
  const firstPage = useCallback(() => setPage(1), [setPage]);
  const lastPage = useCallback(() => setPage(pageCount), [setPage, pageCount]);

  const items = useMemo(
    () => buildPaginationItems(page, pageCount, siblingCount),
    [page, pageCount, siblingCount],
  );

  const startIndex = (page - 1) * pageSize;

  return {
    page,
    pageSize,
    pageCount,
    startIndex,
    endIndex: Math.min(startIndex + pageSize, totalItems),
    canPreviousPage: page > 1,
    canNextPage: page < pageCount,
    isFirstPage: page === 1,
    isLastPage: page === pageCount,
    items,
    setPage,
    setPageSize,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
  };
}
