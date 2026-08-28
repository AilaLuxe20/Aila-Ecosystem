import type { ErrorCode } from "@/lib/errors/app-error";

/**
 * Wire contracts shared by the API client and the server route handlers.
 *
 * Both sides import these, so a change to the envelope is a compile error on
 * whichever side has not been updated.
 */

/** HTTP methods the client supports. */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** Header name carrying the correlation ID on every request and response. */
export const REQUEST_ID_HEADER = "x-request-id";

/** A successful API response envelope. */
export interface ApiSuccessBody<T> {
  readonly data: T;
  readonly meta?: ApiMeta;
}

/** A failed API response envelope. */
export interface ApiErrorBody {
  readonly error: {
    readonly code: ErrorCode;
    readonly message: string;
    readonly fieldErrors?: Readonly<Record<string, string>>;
    readonly context?: Readonly<Record<string, unknown>>;
  };
}

/** Any API response envelope. */
export type ApiResponseBody<T> = ApiSuccessBody<T> | ApiErrorBody;

/** Metadata accompanying a successful response. */
export interface ApiMeta {
  readonly requestId?: string;
  readonly pagination?: PaginationMeta;
  readonly [key: string]: unknown;
}

/** Pagination descriptor returned alongside a page of results. */
export interface PaginationMeta {
  readonly page: number;
  readonly pageSize: number;
  readonly totalItems: number;
  readonly pageCount: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
}

/** A page of results plus its pagination descriptor. */
export interface Paginated<T> {
  readonly items: readonly T[];
  readonly pagination: PaginationMeta;
}

/**
 * Narrows a response envelope to its error variant.
 *
 * @param body - The parsed response body.
 * @returns True when the body describes an error.
 */
export function isApiErrorBody<T>(body: ApiResponseBody<T>): body is ApiErrorBody {
  return typeof body === "object" && body !== null && "error" in body;
}

/**
 * Builds a pagination descriptor from raw counts.
 *
 * @param page - Current one-based page.
 * @param pageSize - Items per page.
 * @param totalItems - Total matching items.
 * @returns The pagination metadata.
 */
export function buildPaginationMeta(
  page: number,
  pageSize: number,
  totalItems: number,
): PaginationMeta {
  const pageCount = Math.max(1, Math.ceil(totalItems / Math.max(pageSize, 1)));

  return {
    page,
    pageSize,
    totalItems,
    pageCount,
    hasNextPage: page < pageCount,
    hasPreviousPage: page > 1,
  };
}
