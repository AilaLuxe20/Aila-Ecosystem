import type { NextRequest } from "next/server";

import { REQUEST_ID_HEADER } from "@/lib/api/types";
import { createRequestId } from "@/lib/api/request";
import type { Logger } from "@/lib/logger/logger";
import type { UserRole } from "@/types/auth";

/**
 * Per-request context threaded through the handler pipeline.
 *
 * Middleware refines this object as the request travels through the chain: the
 * base handler creates it, the auth layer attaches the actor, and the
 * authorisation layer narrows the role. Each stage's return type reflects what
 * it guarantees, so a handler that requires an authenticated actor cannot
 * compile without one.
 */

/** The signed-in caller. */
export interface Actor {
  readonly userId: string;
  readonly role: UserRole;
}

/** Context available to every handler. */
export interface RequestContext {
  readonly request: NextRequest;
  /** Correlation ID, taken from the inbound header or generated. */
  readonly requestId: string;
  /** Logger pre-bound to this request's correlation ID. */
  readonly logger: Logger;
  /** Dynamic route parameters. */
  readonly params: Readonly<Record<string, string>>;
  /** Parsed query string. */
  readonly searchParams: URLSearchParams;
  /** When the request entered the pipeline. */
  readonly startedAt: number;
}

/** Context guaranteed to carry an authenticated actor. */
export interface AuthenticatedContext extends RequestContext {
  readonly actor: Actor;
}

/**
 * Reads the inbound correlation ID, generating one when absent.
 *
 * Reusing the caller's ID is what allows a single trace to span the browser,
 * this service, and anything downstream.
 *
 * @param request - The inbound request.
 * @returns The correlation ID for this request.
 */
export function resolveRequestId(request: NextRequest): string {
  return request.headers.get(REQUEST_ID_HEADER) ?? createRequestId();
}

/**
 * Extracts the caller's IP address for rate limiting.
 *
 * Reads `x-forwarded-for` first because the app sits behind a proxy in every
 * deployed environment.
 *
 * @param request - The inbound request.
 * @returns The client IP, or `"unknown"` when it cannot be determined.
 */
export function resolveClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  return request.headers.get("x-real-ip") ?? "unknown";
}
