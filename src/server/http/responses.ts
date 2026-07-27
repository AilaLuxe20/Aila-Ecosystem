import { NextResponse } from "next/server";

import { buildErrorResponseBody } from "@/lib/errors/formatter";
import { isDevelopment } from "@/lib/config/env";
import {
  REQUEST_ID_HEADER,
  buildPaginationMeta,
  type ApiMeta,
  type ApiSuccessBody,
} from "@/lib/api/types";

/**
 * Response helpers for route handlers.
 *
 * Every response goes through one of these so the envelope, the correlation
 * header, and the status mapping stay identical across the whole API.
 */

/** Extra options accepted by the response helpers. */
export interface ResponseOptions {
  /** Correlation ID echoed back to the caller. */
  readonly requestId?: string;
  /** Additional response headers. */
  readonly headers?: Record<string, string>;
  /** Metadata merged into the envelope. */
  readonly meta?: ApiMeta;
}

/**
 * Merges caller headers with the correlation ID.
 *
 * @param options - Response options.
 * @returns The header map to attach.
 */
function buildHeaders(options: ResponseOptions): Record<string, string> {
  const headers: Record<string, string> = { ...options.headers };
  if (options.requestId) headers[REQUEST_ID_HEADER] = options.requestId;
  return headers;
}

/**
 * Returns `200 OK` with a data envelope.
 *
 * @param data - The payload.
 * @param options - Correlation ID, headers, and metadata.
 * @returns The response.
 */
export function ok<T>(data: T, options: ResponseOptions = {}): NextResponse<ApiSuccessBody<T>> {
  const body: ApiSuccessBody<T> = options.meta ? { data, meta: options.meta } : { data };
  return NextResponse.json(body, { status: 200, headers: buildHeaders(options) });
}

/**
 * Returns `201 Created` with a data envelope.
 *
 * @param data - The created resource.
 * @param options - Correlation ID, headers, and metadata.
 * @returns The response.
 */
export function created<T>(
  data: T,
  options: ResponseOptions = {},
): NextResponse<ApiSuccessBody<T>> {
  const body: ApiSuccessBody<T> = options.meta ? { data, meta: options.meta } : { data };
  return NextResponse.json(body, { status: 201, headers: buildHeaders(options) });
}

/**
 * Returns `202 Accepted` for work that will complete asynchronously.
 *
 * @param data - Describes the accepted work.
 * @param options - Correlation ID, headers, and metadata.
 * @returns The response.
 */
export function accepted<T>(
  data: T,
  options: ResponseOptions = {},
): NextResponse<ApiSuccessBody<T>> {
  return NextResponse.json({ data }, { status: 202, headers: buildHeaders(options) });
}

/**
 * Returns `204 No Content`.
 *
 * @param options - Correlation ID and headers.
 * @returns The response.
 */
export function noContent(options: ResponseOptions = {}): NextResponse<null> {
  return new NextResponse(null, {
    status: 204,
    headers: buildHeaders(options),
  }) as NextResponse<null>;
}

/**
 * Returns `200 OK` with a page of results and its pagination metadata.
 *
 * @param items - The page of results.
 * @param page - Current one-based page.
 * @param pageSize - Items per page.
 * @param totalItems - Total matching items.
 * @param options - Correlation ID and headers.
 * @returns The response.
 */
export function paginated<T>(
  items: readonly T[],
  page: number,
  pageSize: number,
  totalItems: number,
  options: ResponseOptions = {},
): NextResponse<ApiSuccessBody<readonly T[]>> {
  return NextResponse.json(
    {
      data: items,
      meta: {
        ...options.meta,
        requestId: options.requestId,
        pagination: buildPaginationMeta(page, pageSize, totalItems),
      },
    },
    { status: 200, headers: buildHeaders(options) },
  );
}

/**
 * Converts any thrown value into an error response.
 *
 * Internal detail is included only in development; in production a
 * non-operational error is reduced to a generic message so implementation
 * details never leak.
 *
 * @param error - The caught value.
 * @param options - Correlation ID and headers.
 * @returns The error response.
 */
export function failure(
  error: unknown,
  options: ResponseOptions = {},
): NextResponse<Record<string, unknown>> {
  const { body, status } = buildErrorResponseBody(error, isDevelopment);
  return NextResponse.json(body, { status, headers: buildHeaders(options) });
}
