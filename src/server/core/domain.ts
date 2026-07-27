/**
 * Domain primitives shared by the repository, service, and mapper layers.
 */

/** Fields every persisted entity carries. */
export interface Entity {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/** An entity that is hidden rather than deleted. */
export interface SoftDeletable {
  readonly deletedAt: Date | null;
}

/** Sort direction for a query. */
export type SortDirection = "asc" | "desc";

/** A sort instruction over a field of `T`. */
export interface SortSpec<T> {
  readonly field: keyof T & string;
  readonly direction: SortDirection;
}

/** Offset-based paging parameters. */
export interface PageRequest {
  /** One-based page number. */
  readonly page: number;
  /** Items per page. */
  readonly pageSize: number;
}

/** A page of entities plus the total matching count. */
export interface Page<T> {
  readonly items: readonly T[];
  readonly totalItems: number;
  readonly page: number;
  readonly pageSize: number;
}

/** Query options accepted by the repository layer. */
export interface QueryOptions<T> {
  readonly page?: PageRequest;
  readonly sort?: readonly SortSpec<T>[];
  /** Exact-match filters applied with AND semantics. */
  readonly filters?: Partial<Record<keyof T & string, unknown>>;
  /** Free-text search term, interpreted by the concrete repository. */
  readonly search?: string;
  /** Includes soft-deleted rows. Defaults to false. */
  readonly includeDeleted?: boolean;
}

/**
 * Converts a page request into the offset and limit a database expects.
 *
 * @param page - The page request.
 * @returns The equivalent offset and limit.
 */
export function toOffsetLimit(page: PageRequest): { offset: number; limit: number } {
  const safePage = Math.max(1, Math.trunc(page.page));
  const safeSize = Math.max(1, Math.trunc(page.pageSize));

  return { offset: (safePage - 1) * safeSize, limit: safeSize };
}

/**
 * Assembles a page result.
 *
 * @param items - The items on this page.
 * @param totalItems - Total matching items across all pages.
 * @param page - The originating page request.
 * @returns The page result.
 */
export function createPage<T>(
  items: readonly T[],
  totalItems: number,
  page: PageRequest,
): Page<T> {
  return { items, totalItems, page: page.page, pageSize: page.pageSize };
}
