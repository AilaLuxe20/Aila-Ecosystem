import type { z } from "zod";

import { APP_CONFIG, REQUEST_CONFIG } from "@/lib/config/app";
import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  ExternalServiceError,
  InternalError,
  NotFoundError,
  RateLimitError,
  TimeoutError,
  ValidationError,
  toAppError,
} from "@/lib/errors/app-error";
import { retry } from "@/lib/errors/recovery";
import { createLogger } from "@/lib/logger/logger";
import { flattenZodError } from "@/lib/utils/validation";

import { MemoryCache, buildCacheKey } from "./cache";
import { RequestBuilder, type BuiltRequest } from "./request";
import { REQUEST_ID_HEADER, isApiErrorBody, type ApiResponseBody, type HttpMethod } from "./types";

/**
 * The platform's typed HTTP client.
 *
 * Responsibilities, in the order they run: build the request, apply auth and
 * request interceptors, attach a correlation ID, enforce a timeout, retry
 * transient failures with backoff, map HTTP status codes onto the typed error
 * hierarchy, and validate the response body against a schema.
 *
 * Passing a Zod schema is what makes this "typed" in a meaningful sense — the
 * return type is inferred from the schema and the payload is checked at
 * runtime, so a backend contract change surfaces immediately rather than as an
 * `undefined` three components deeper.
 */

const clientLogger = createLogger("api.client");

/** Mutates a request before it is sent. */
export type RequestInterceptor = (request: BuiltRequest) => BuiltRequest | Promise<BuiltRequest>;

/** Observes a response before it is parsed. */
export type ResponseInterceptor = (response: Response, request: BuiltRequest) => void | Promise<void>;

/** Options for {@link ApiClient}. */
export interface ApiClientOptions {
  /** Base URL prefixed to every request. Defaults to `"/api"`. */
  readonly baseUrl?: string;
  /** Headers merged into every request. */
  readonly defaultHeaders?: Record<string, string>;
  /** Time budget per attempt, in milliseconds. */
  readonly timeoutMs?: number;
  /** Total attempts for retryable failures. */
  readonly retryAttempts?: number;
  /** Supplies an auth token per request. */
  readonly getAuthToken?: () => string | null | Promise<string | null>;
  /** Runs before each request is sent. */
  readonly requestInterceptors?: readonly RequestInterceptor[];
  /** Runs after each response is received. */
  readonly responseInterceptors?: readonly ResponseInterceptor[];
  /** Cache used for `GET` requests that opt in. */
  readonly cache?: MemoryCache<unknown>;
}

/** Per-call options. */
export interface RequestOptions<TResponse> {
  /** Query parameters appended to the URL. */
  readonly query?: Record<string, string | number | boolean | null | undefined>;
  /** Additional headers for this call. */
  readonly headers?: Record<string, string>;
  /** Cancels the request. */
  readonly signal?: AbortSignal;
  /** Validates and types the response body. */
  readonly schema?: z.ZodType<TResponse>;
  /** Caches the result for this many milliseconds. `GET` only. */
  readonly cacheTtlMs?: number;
  /** Overrides the client's retry count for this call. */
  readonly retryAttempts?: number;
  /** Overrides the client's timeout for this call. */
  readonly timeoutMs?: number;
}

/**
 * Maps an HTTP status onto the typed error hierarchy.
 *
 * @param status - HTTP status code.
 * @param message - Message from the response body.
 * @param context - Diagnostic detail attached to the error.
 * @param fieldErrors - Field-level messages for a validation failure.
 * @returns The corresponding `AppError` subclass.
 */
function errorForStatus(
  status: number,
  message: string,
  context: Record<string, unknown>,
  fieldErrors?: Record<string, string>,
): AppError {
  switch (status) {
    case 400:
    case 422:
      return new ValidationError(fieldErrors ?? {}, { message, context });
    case 401:
      return new AuthenticationError({ message, context });
    case 403:
      return new AuthorizationError({ message, context });
    case 404:
      return new NotFoundError("Resource", { message, context });
    case 409:
      return new ConflictError({ message, context });
    case 408:
      return new TimeoutError({ message, context });
    case 429:
      return new RateLimitError(60, { message, context });
    default:
      if (status >= 500) return new ExternalServiceError("Upstream service", { message, context });
      return new InternalError({ message, context });
  }
}

/** A typed HTTP client with retries, caching, and schema validation. */
export class ApiClient {
  private readonly baseUrl: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly timeoutMs: number;
  private readonly retryAttempts: number;
  private readonly getAuthToken?: () => string | null | Promise<string | null>;
  private readonly requestInterceptors: readonly RequestInterceptor[];
  private readonly responseInterceptors: readonly ResponseInterceptor[];
  private readonly cache: MemoryCache<unknown>;

  /** @param options - Base URL, headers, timeouts, interceptors, and cache. */
  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? "/api";
    this.defaultHeaders = options.defaultHeaders ?? {};
    this.timeoutMs = options.timeoutMs ?? REQUEST_CONFIG.timeoutMs;
    this.retryAttempts = options.retryAttempts ?? REQUEST_CONFIG.retryAttempts;
    this.getAuthToken = options.getAuthToken;
    this.requestInterceptors = options.requestInterceptors ?? [];
    this.responseInterceptors = options.responseInterceptors ?? [];
    this.cache = options.cache ?? new MemoryCache<unknown>();
  }

  /**
   * Issues a `GET` request.
   *
   * @param path - Path appended to the base URL.
   * @param options - Query, headers, schema, and caching options.
   * @returns The parsed response payload.
   */
  get<TResponse>(path: string, options: RequestOptions<TResponse> = {}): Promise<TResponse> {
    return this.request<TResponse>("GET", path, undefined, options);
  }

  /**
   * Issues a `POST` request with a JSON body.
   *
   * @param path - Path appended to the base URL.
   * @param body - Value serialised as JSON.
   * @param options - Query, headers, and schema options.
   * @returns The parsed response payload.
   */
  post<TResponse>(
    path: string,
    body?: unknown,
    options: RequestOptions<TResponse> = {},
  ): Promise<TResponse> {
    return this.request<TResponse>("POST", path, body, options);
  }

  /**
   * Issues a `PUT` request with a JSON body.
   *
   * @param path - Path appended to the base URL.
   * @param body - Value serialised as JSON.
   * @param options - Query, headers, and schema options.
   * @returns The parsed response payload.
   */
  put<TResponse>(
    path: string,
    body?: unknown,
    options: RequestOptions<TResponse> = {},
  ): Promise<TResponse> {
    return this.request<TResponse>("PUT", path, body, options);
  }

  /**
   * Issues a `PATCH` request with a JSON body.
   *
   * @param path - Path appended to the base URL.
   * @param body - Value serialised as JSON.
   * @param options - Query, headers, and schema options.
   * @returns The parsed response payload.
   */
  patch<TResponse>(
    path: string,
    body?: unknown,
    options: RequestOptions<TResponse> = {},
  ): Promise<TResponse> {
    return this.request<TResponse>("PATCH", path, body, options);
  }

  /**
   * Issues a `DELETE` request.
   *
   * @param path - Path appended to the base URL.
   * @param options - Query, headers, and schema options.
   * @returns The parsed response payload.
   */
  delete<TResponse>(path: string, options: RequestOptions<TResponse> = {}): Promise<TResponse> {
    return this.request<TResponse>("DELETE", path, undefined, options);
  }

  /**
   * Uploads `FormData`, letting the browser set the multipart boundary.
   *
   * @param path - Path appended to the base URL.
   * @param data - The form data to send.
   * @param options - Query, headers, and schema options.
   * @returns The parsed response payload.
   */
  upload<TResponse>(
    path: string,
    data: FormData,
    options: RequestOptions<TResponse> = {},
  ): Promise<TResponse> {
    return this.request<TResponse>("POST", path, data, options);
  }

  /**
   * Invalidates cached `GET` responses.
   *
   * @param pattern - Substring or pattern matched against cache keys.
   * @returns How many entries were removed.
   */
  invalidate(pattern: string | RegExp): number {
    return this.cache.invalidate(pattern);
  }

  /**
   * Executes a request through the full pipeline.
   *
   * @param method - HTTP method.
   * @param path - Path appended to the base URL.
   * @param body - Request payload.
   * @param options - Per-call options.
   * @returns The parsed response payload.
   */
  private async request<TResponse>(
    method: HttpMethod,
    path: string,
    body: unknown,
    options: RequestOptions<TResponse>,
  ): Promise<TResponse> {
    const isCacheable = method === "GET" && options.cacheTtlMs !== undefined;
    const cacheKey = buildCacheKey(`${this.baseUrl}/${path}`, options.query);

    if (isCacheable) {
      return this.cache.resolve(
        cacheKey,
        () => this.dispatch<TResponse>(method, path, body, options),
        options.cacheTtlMs,
      ) as Promise<TResponse>;
    }

    return this.dispatch<TResponse>(method, path, body, options);
  }

  /**
   * Builds, sends, and parses a single request, with retries.
   *
   * @param method - HTTP method.
   * @param path - Path appended to the base URL.
   * @param body - Request payload.
   * @param options - Per-call options.
   * @returns The parsed response payload.
   */
  private async dispatch<TResponse>(
    method: HttpMethod,
    path: string,
    body: unknown,
    options: RequestOptions<TResponse>,
  ): Promise<TResponse> {
    let builder = RequestBuilder.for(this.baseUrl)
      .path(path)
      .method(method)
      .headers(this.defaultHeaders)
      .signal(options.signal);

    if (options.query) builder = builder.query(options.query);
    if (options.headers) builder = builder.headers(options.headers);

    if (body instanceof FormData) {
      builder = builder.formData(body);
    } else if (body !== undefined) {
      builder = builder.json(body);
    }

    const token = await this.getAuthToken?.();
    if (token) builder = builder.header("authorization", `Bearer ${token}`);

    let request = builder.build();
    for (const interceptor of this.requestInterceptors) {
      request = await interceptor(request);
    }

    return retry(
      async () => this.send<TResponse>(request, options),
      {
        attempts: options.retryAttempts ?? this.retryAttempts,
        baseDelayMs: REQUEST_CONFIG.retryBaseDelayMs,
        maxDelayMs: REQUEST_CONFIG.retryMaxDelayMs,
        signal: options.signal,
        onRetry: (error, attempt, delayMs) => {
          clientLogger.warn("Retrying request.", {
            requestId: request.requestId,
            url: request.url,
            attempt,
            delayMs,
            error: toAppError(error).code,
          });
        },
      },
    );
  }

  /**
   * Performs a single network attempt and maps the result.
   *
   * @param request - The built request.
   * @param options - Per-call options.
   * @returns The parsed response payload.
   */
  private async send<TResponse>(
    request: BuiltRequest,
    options: RequestOptions<TResponse>,
  ): Promise<TResponse> {
    const budgetMs = options.timeoutMs ?? this.timeoutMs;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), budgetMs);

    // Honours both the caller's signal and the timeout.
    const onExternalAbort = (): void => controller.abort();
    request.signal?.addEventListener("abort", onExternalAbort, { once: true });

    const startedAt = Date.now();

    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        signal: controller.signal,
        cache: request.cache,
      });

      for (const interceptor of this.responseInterceptors) {
        await interceptor(response, request);
      }

      clientLogger.debug("Request completed.", {
        requestId: request.requestId,
        method: request.method,
        url: request.url,
        status: response.status,
        durationMs: Date.now() - startedAt,
      });

      return await this.parse<TResponse>(response, request, options.schema);
    } catch (caught) {
      if (controller.signal.aborted && !request.signal?.aborted) {
        throw new TimeoutError({
          context: { url: request.url, requestId: request.requestId, timeoutMs: budgetMs },
          cause: caught,
        });
      }
      throw toAppError(caught);
    } finally {
      clearTimeout(timer);
      request.signal?.removeEventListener("abort", onExternalAbort);
    }
  }

  /**
   * Parses a response, mapping failures onto typed errors.
   *
   * @param response - The raw response.
   * @param request - The originating request.
   * @param schema - Optional schema validating the payload.
   * @returns The parsed payload.
   */
  private async parse<TResponse>(
    response: Response,
    request: BuiltRequest,
    schema?: z.ZodType<TResponse>,
  ): Promise<TResponse> {
    const requestId = response.headers.get(REQUEST_ID_HEADER) ?? request.requestId;
    const context = { url: request.url, status: response.status, requestId };

    if (response.status === 204) return undefined as TResponse;

    const isJson = response.headers.get("content-type")?.includes("application/json") ?? false;
    const payload: unknown = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const envelope = payload as ApiResponseBody<unknown>;

      if (isJson && typeof envelope === "object" && envelope !== null && isApiErrorBody(envelope)) {
        throw errorForStatus(
          response.status,
          envelope.error.message,
          { ...context, code: envelope.error.code },
          envelope.error.fieldErrors ? { ...envelope.error.fieldErrors } : undefined,
        );
      }

      throw errorForStatus(response.status, response.statusText || "Request failed.", context);
    }

    // Unwrap the standard envelope when present, so callers work with payloads
    // rather than transport structure.
    const data =
      isJson && typeof payload === "object" && payload !== null && "data" in payload
        ? (payload as { data: unknown }).data
        : payload;

    if (!schema) return data as TResponse;

    const parsed = schema.safeParse(data);

    if (!parsed.success) {
      clientLogger.error("Response failed schema validation.", parsed.error, context);
      throw new ValidationError(flattenZodError(parsed.error), {
        message: "The server returned an unexpected response.",
        context,
      });
    }

    return parsed.data;
  }
}

/** The shared client for same-origin calls to this app's API routes. */
export const apiClient = new ApiClient({ baseUrl: "/api" });

/**
 * Creates a client bound to an external service.
 *
 * @param baseUrl - Absolute base URL of the service.
 * @param options - Additional client options.
 * @returns The configured client.
 */
export function createApiClient(baseUrl: string, options: ApiClientOptions = {}): ApiClient {
  return new ApiClient({ ...options, baseUrl: baseUrl || APP_CONFIG.url });
}
