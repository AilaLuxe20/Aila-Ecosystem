import { NextResponse } from "next/server";

import { AilaAuthenticationError, requirePrismaUser } from "@/core/auth/clerk-user";
import { assertProductEntitlement } from "@/lib/auth/require-product-access";
import type { ProductKey } from "@/core/products/catalog";
import { MemoryRateLimiter, rateLimitHeaders, type RateLimitResult } from "@/lib/api/rate-limit";
import {
  AuthenticationError,
  RateLimitError,
  ValidationError,
  toAppError,
} from "@/lib/errors/app-error";
import { flattenZodError } from "@/lib/utils/validation";
import { failure } from "@/server/http/responses";
import { z } from "zod";

export function createProductRateLimiters(product: string) {
  const read = new MemoryRateLimiter({
    limit: 120,
    windowMs: 60_000,
  });
  const write = new MemoryRateLimiter({
    limit: 60,
    windowMs: 60_000,
  });

  return {
    async enforceRead(userId: string) {
      return enforceProductRateLimit(read, product, userId);
    },
    async enforceWrite(userId: string) {
      return enforceProductRateLimit(write, product, userId);
    },
  };
}

export function searchParamsObject(searchParams: URLSearchParams): Record<string, string> {
  const raw: Record<string, string> = {};

  for (const [key, value] of searchParams.entries()) {
    if (value !== "") {
      raw[key] = value;
    }
  }

  return raw;
}

export function parseJsonBody<T>(value: unknown, schema: z.ZodType<T>): T {
  const parsed = schema.safeParse(value);

  if (!parsed.success) {
    throw new ValidationError(flattenZodError(parsed.error), {
      message: "The submitted data is invalid.",
    });
  }

  return parsed.data;
}

export async function readJsonBody(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new ValidationError({}, { message: "Request body must be valid JSON." });
  }
}

export async function requireWorkspaceUser(product?: ProductKey) {
  try {
    if (product) {
      return await assertProductEntitlement(product);
    }

    return await requirePrismaUser();
  } catch (error) {
    if (error instanceof AilaAuthenticationError) {
      throw new AuthenticationError({ message: error.message });
    }

    throw error;
  }
}

export async function enforceProductRateLimit(
  limiter: MemoryRateLimiter,
  product: string,
  userId: string,
) {
  const result = await limiter.check(`${product}:${userId}`);

  if (!result.allowed) {
    throw new RateLimitError(result.retryAfterSeconds);
  }

  return result;
}

export function workspaceFailure(error: unknown): NextResponse {
  return failure(toAppError(error));
}

export function withRateLimitHeaders(
  response: NextResponse,
  rateLimit: RateLimitResult,
): NextResponse {
  for (const [name, value] of Object.entries(rateLimitHeaders(rateLimit))) {
    response.headers.set(name, value);
  }

  return response;
}
