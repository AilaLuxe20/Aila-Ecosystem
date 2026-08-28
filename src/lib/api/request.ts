import { buildQueryString, type QueryParams } from "@/lib/utils/url";

import { REQUEST_ID_HEADER, type HttpMethod } from "./types";

/**
 * Immutable request builder.
 *
 * Every method returns a new builder rather than mutating, so a configured base
 * request can be shared and specialised safely:
 *
 * ```ts
 * const authed = RequestBuilder.for("/api").header("authorization", token);
 * const listUsers = authed.path("users").query({ page: 1 }).build();
 * ```
 */

/** A fully described request, ready to hand to `fetch`. */
export interface BuiltRequest {
  readonly url: string;
  readonly method: HttpMethod;
  readonly headers: Readonly<Record<string, string>>;
  readonly body: BodyInit | null;
  readonly signal: AbortSignal | undefined;
  readonly requestId: string;
  readonly cache: RequestCache | undefined;
}

/**
 * Generates a correlation ID for a request.
 *
 * Falls back to a random string where `crypto.randomUUID` is unavailable, so
 * the ID is always present even on older runtimes.
 *
 * @returns A unique request identifier.
 */
export function createRequestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `req_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

/** Fluent, immutable builder for HTTP requests. */
export class RequestBuilder {
  private constructor(
    private readonly baseUrl: string,
    private readonly segments: readonly string[],
    private readonly queryParams: QueryParams,
    private readonly headerMap: Readonly<Record<string, string>>,
    private readonly httpMethod: HttpMethod,
    private readonly payload: BodyInit | null,
    private readonly abortSignal: AbortSignal | undefined,
    private readonly cacheMode: RequestCache | undefined,
    private readonly requestId: string,
  ) {}

  /**
   * Starts a builder against a base URL.
   *
   * @param baseUrl - Origin or path prefix, e.g. `"/api"`.
   * @returns A new builder.
   */
  static for(baseUrl: string): RequestBuilder {
    return new RequestBuilder(
      baseUrl.replace(/\/+$/, ""),
      [],
      {},
      { accept: "application/json" },
      "GET",
      null,
      undefined,
      undefined,
      createRequestId(),
    );
  }

  /**
   * Appends one or more path segments.
   *
   * @param segments - Segments to append; leading and trailing slashes are trimmed.
   * @returns A new builder.
   */
  path(...segments: readonly string[]): RequestBuilder {
    const cleaned = segments
      .flatMap((segment) => segment.split("/"))
      .map((segment) => segment.trim())
      .filter((segment) => segment.length > 0);

    return this.clone({ segments: [...this.segments, ...cleaned] });
  }

  /**
   * Merges query parameters.
   *
   * @param params - Parameters to merge over any already set.
   * @returns A new builder.
   */
  query(params: QueryParams): RequestBuilder {
    return this.clone({ queryParams: { ...this.queryParams, ...params } });
  }

  /**
   * Sets a single header. Names are lower-cased for consistent overriding.
   *
   * @param name - Header name.
   * @param value - Header value.
   * @returns A new builder.
   */
  header(name: string, value: string): RequestBuilder {
    return this.clone({
      headerMap: { ...this.headerMap, [name.toLowerCase()]: value },
    });
  }

  /**
   * Merges several headers at once.
   *
   * @param headers - Headers to merge.
   * @returns A new builder.
   */
  headers(headers: Record<string, string>): RequestBuilder {
    const lowered = Object.fromEntries(
      Object.entries(headers).map(([name, value]) => [name.toLowerCase(), value]),
    );
    return this.clone({ headerMap: { ...this.headerMap, ...lowered } });
  }

  /**
   * Sets the HTTP method.
   *
   * @param method - The method to use.
   * @returns A new builder.
   */
  method(method: HttpMethod): RequestBuilder {
    return this.clone({ httpMethod: method });
  }

  /**
   * Serialises a value as a JSON body and sets the content type.
   *
   * @param value - Value to serialise.
   * @returns A new builder.
   */
  json(value: unknown): RequestBuilder {
    return this.clone({
      payload: JSON.stringify(value),
      headerMap: { ...this.headerMap, "content-type": "application/json" },
    });
  }

  /**
   * Attaches a `FormData` body.
   *
   * The content type is deliberately left unset so the browser can add the
   * multipart boundary; setting it manually breaks the upload.
   *
   * @param data - The form data.
   * @returns A new builder.
   */
  formData(data: FormData): RequestBuilder {
    const rest = { ...this.headerMap };
    delete rest["content-type"];
    return this.clone({ payload: data, headerMap: rest });
  }

  /**
   * Attaches a raw body without altering headers.
   *
   * @param body - The body to send.
   * @returns A new builder.
   */
  body(body: BodyInit | null): RequestBuilder {
    return this.clone({ payload: body });
  }

  /**
   * Attaches an abort signal.
   *
   * @param signal - Signal used to cancel the request.
   * @returns A new builder.
   */
  signal(signal: AbortSignal | undefined): RequestBuilder {
    return this.clone({ abortSignal: signal });
  }

  /**
   * Sets the fetch cache mode.
   *
   * @param mode - Standard `RequestCache` value.
   * @returns A new builder.
   */
  cache(mode: RequestCache): RequestBuilder {
    return this.clone({ cacheMode: mode });
  }

  /**
   * Finalises the request.
   *
   * @returns The built request description.
   */
  build(): BuiltRequest {
    const path = this.segments.join("/");
    const base = path.length > 0 ? `${this.baseUrl}/${path}` : this.baseUrl;
    const search = buildQueryString(this.queryParams);

    return {
      url: search.length > 0 ? `${base}?${search}` : base,
      method: this.httpMethod,
      headers: { ...this.headerMap, [REQUEST_ID_HEADER]: this.requestId },
      body: this.payload,
      signal: this.abortSignal,
      requestId: this.requestId,
      cache: this.cacheMode,
    };
  }

  /**
   * Produces a copy with selected fields replaced.
   *
   * @param overrides - Fields to change.
   * @returns The new builder.
   */
  private clone(overrides: Partial<{
    segments: readonly string[];
    queryParams: QueryParams;
    headerMap: Readonly<Record<string, string>>;
    httpMethod: HttpMethod;
    payload: BodyInit | null;
    abortSignal: AbortSignal | undefined;
    cacheMode: RequestCache | undefined;
  }>): RequestBuilder {
    return new RequestBuilder(
      this.baseUrl,
      overrides.segments ?? this.segments,
      overrides.queryParams ?? this.queryParams,
      overrides.headerMap ?? this.headerMap,
      overrides.httpMethod ?? this.httpMethod,
      overrides.payload !== undefined ? overrides.payload : this.payload,
      "abortSignal" in overrides ? overrides.abortSignal : this.abortSignal,
      "cacheMode" in overrides ? overrides.cacheMode : this.cacheMode,
      this.requestId,
    );
  }
}
