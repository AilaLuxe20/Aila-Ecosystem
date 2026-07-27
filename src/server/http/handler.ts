import { auth } from "@clerk/nextjs/server";
import type { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";

import { enforceRateLimit, rateLimitHeaders, type RateLimiter } from "@/lib/api/rate-limit";
import {
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  toAppError,
} from "@/lib/errors/app-error";
import { createLogger } from "@/lib/logger/logger";
import { canAccess } from "@/lib/auth/can-access";
import { flattenZodError } from "@/lib/utils/validation";
import type { UserRole } from "@/types/auth";

import {
  resolveClientIp,
  resolveRequestId,
  type Actor,
  type AuthenticatedContext,
  type RequestContext,
} from "./context";
import { failure } from "./responses";

/**
 * Composable route-handler pipeline.
 *
 * A route is assembled by wrapping a handler in the layers it needs:
 *
 * ```ts
 * export const POST = route()
 *   .authenticated()
 *   .authorized("commerce")
 *   .body(createOrderSchema)
 *   .handle(async (context, body) => created(await orders.create(body)));
 * ```
 *
 * Each layer narrows the context type, so a handler declared behind
 * `.authenticated()` receives an `AuthenticatedContext` and one that is not
 * cannot read `context.actor` at all.
 *
 * This module consumes the existing Clerk helpers; it does not reimplement or
 * modify them.
 */

const routeLogger = createLogger("server.route");

/** A handler receiving a context and returning a response. */
export type Handler<TContext extends RequestContext, TBody = void> = TBody extends void
  ? (context: TContext) => Promise<NextResponse> | NextResponse
  : (context: TContext, body: TBody) => Promise<NextResponse> | NextResponse;

/** Next.js route segment arguments. */
export interface RouteSegment {
  readonly params: Promise<Record<string, string>>;
}

/** A Next.js route export. */
export type RouteHandler = (
  request: NextRequest,
  segment: RouteSegment,
) => Promise<NextResponse>;

/** Configuration accumulated by the builder. */
interface RouteConfig<TBody> {
  readonly requireAuth: boolean;
  readonly product: string | null;
  readonly roles: readonly UserRole[] | null;
  readonly bodySchema: z.ZodType<TBody> | null;
  readonly querySchema: z.ZodType<unknown> | null;
  readonly limiter: RateLimiter | null;
}

/**
 * Resolves the calling actor from Clerk's session.
 *
 * @returns The actor, or `null` when the caller is anonymous.
 */
async function resolveActor(): Promise<Actor | null> {
  const { userId, sessionClaims } = await auth();
  if (!userId) return null;

  return {
    userId,
    role: sessionClaims?.metadata?.role ?? "guest",
  };
}

/**
 * Reads and validates a JSON request body.
 *
 * @param request - The inbound request.
 * @param schema - Schema the body must satisfy.
 * @returns The parsed body.
 * @throws {ValidationError} When the body is absent or invalid.
 */
async function parseBody<TBody>(
  request: NextRequest,
  schema: z.ZodType<TBody>,
): Promise<TBody> {
  let raw: unknown;

  try {
    raw = await request.json();
  } catch {
    throw new ValidationError({}, { message: "Request body must be valid JSON." });
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new ValidationError(flattenZodError(parsed.error), {
      message: "The submitted data is invalid.",
    });
  }

  return parsed.data;
}

/** Fluent builder assembling a route handler from middleware layers. */
export class RouteBuilder<TContext extends RequestContext, TBody> {
  /** @param config - Accumulated layer configuration. */
  private constructor(private readonly config: RouteConfig<TBody>) {}

  /**
   * Starts a route with no layers applied.
   *
   * @returns A new builder.
   */
  static create(): RouteBuilder<RequestContext, void> {
    return new RouteBuilder<RequestContext, void>({
      requireAuth: false,
      product: null,
      roles: null,
      bodySchema: null,
      querySchema: null,
      limiter: null,
    });
  }

  /**
   * Requires an authenticated caller and attaches the actor to the context.
   *
   * @returns A builder whose handler receives an {@link AuthenticatedContext}.
   */
  authenticated(): RouteBuilder<AuthenticatedContext, TBody> {
    return new RouteBuilder<AuthenticatedContext, TBody>({
      ...this.config,
      requireAuth: true,
    });
  }

  /**
   * Requires access to a product, using the existing permission matrix.
   *
   * Implies {@link authenticated}.
   *
   * @param product - Product key checked against the caller's role.
   * @returns A builder enforcing product access.
   */
  authorized(product: string): RouteBuilder<AuthenticatedContext, TBody> {
    return new RouteBuilder<AuthenticatedContext, TBody>({
      ...this.config,
      requireAuth: true,
      product,
    });
  }

  /**
   * Restricts the route to specific roles. Implies {@link authenticated}.
   *
   * @param roles - Roles permitted to call this route.
   * @returns A builder enforcing the role check.
   */
  withRoles(...roles: readonly UserRole[]): RouteBuilder<AuthenticatedContext, TBody> {
    return new RouteBuilder<AuthenticatedContext, TBody>({
      ...this.config,
      requireAuth: true,
      roles,
    });
  }

  /**
   * Validates the JSON body and passes it to the handler as a second argument.
   *
   * @param schema - Schema the body must satisfy.
   * @returns A builder whose handler receives the parsed body.
   */
  body<TNext>(schema: z.ZodType<TNext>): RouteBuilder<TContext, TNext> {
    return new RouteBuilder<TContext, TNext>({
      ...this.config,
      bodySchema: schema,
    } as RouteConfig<TNext>);
  }

  /**
   * Validates the query string, rejecting the request when it does not conform.
   *
   * @param schema - Schema the query parameters must satisfy.
   * @returns A builder enforcing query validation.
   */
  query(schema: z.ZodType<unknown>): RouteBuilder<TContext, TBody> {
    return new RouteBuilder<TContext, TBody>({ ...this.config, querySchema: schema });
  }

  /**
   * Applies a rate limit, keyed by user ID when known and IP otherwise.
   *
   * @param limiter - The limiter to consult.
   * @returns A builder enforcing the limit.
   */
  rateLimit(limiter: RateLimiter): RouteBuilder<TContext, TBody> {
    return new RouteBuilder<TContext, TBody>({ ...this.config, limiter });
  }

  /**
   * Terminates the chain, producing a Next.js route handler.
   *
   * All errors are caught and converted into the standard error envelope, so a
   * thrown `AppError` anywhere below becomes a correctly shaped HTTP response.
   *
   * @param handler - The business logic for this route.
   * @returns The route handler to export from a `route.ts` file.
   */
  handle(handler: Handler<TContext, TBody>): RouteHandler {
    const config = this.config;

    return async (request: NextRequest, segment: RouteSegment): Promise<NextResponse> => {
      const requestId = resolveRequestId(request);
      const startedAt = Date.now();
      const logger = routeLogger.child("handler", {
        requestId,
        method: request.method,
        path: request.nextUrl.pathname,
      });

      let extraHeaders: Record<string, string> = {};

      try {
        const params = segment?.params ? await segment.params : {};

        let actor: Actor | null = null;
        if (config.requireAuth) {
          actor = await resolveActor();
          if (!actor) throw new AuthenticationError();
        }

        if (config.limiter) {
          const key = actor ? `user:${actor.userId}` : `ip:${resolveClientIp(request)}`;
          extraHeaders = rateLimitHeaders(await enforceRateLimit(config.limiter, key));
        }

        if (config.roles && actor && !config.roles.includes(actor.role)) {
          throw new AuthorizationError({
            context: { required: config.roles, actual: actor.role },
          });
        }

        if (config.product && actor && !canAccess(actor.role, config.product)) {
          throw new AuthorizationError({
            context: { product: config.product, role: actor.role },
          });
        }

        if (config.querySchema) {
          const parsed = config.querySchema.safeParse(
            Object.fromEntries(request.nextUrl.searchParams),
          );
          if (!parsed.success) {
            throw new ValidationError(flattenZodError(parsed.error), {
              message: "Invalid query parameters.",
            });
          }
        }

        const context = {
          request,
          requestId,
          logger,
          params,
          searchParams: request.nextUrl.searchParams,
          startedAt,
          ...(actor ? { actor } : {}),
        } as TContext;

        const response = config.bodySchema
          ? await (handler as (context: TContext, body: TBody) => Promise<NextResponse>)(
              context,
              await parseBody(request, config.bodySchema),
            )
          : await (handler as (context: TContext) => Promise<NextResponse>)(context);

        for (const [name, value] of Object.entries(extraHeaders)) {
          response.headers.set(name, value);
        }
        response.headers.set("x-request-id", requestId);

        logger.info("Request handled.", {
          status: response.status,
          durationMs: Date.now() - startedAt,
        });

        return response;
      } catch (caught) {
        const error = toAppError(caught);

        if (error.isOperational) {
          logger.warn("Request rejected.", {
            code: error.code,
            status: error.status,
            durationMs: Date.now() - startedAt,
          });
        } else {
          logger.error("Request failed.", error, { durationMs: Date.now() - startedAt });
        }

        return failure(error, { requestId, headers: extraHeaders });
      }
    };
  }
}

/**
 * Starts a route definition.
 *
 * @returns A fresh {@link RouteBuilder}.
 */
export function route(): RouteBuilder<RequestContext, void> {
  return RouteBuilder.create();
}
