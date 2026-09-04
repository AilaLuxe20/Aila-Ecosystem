import { NextResponse } from "next/server";

import { assertProductEntitlement } from "@/lib/auth/require-product-access";
import { MemoryRateLimiter, rateLimitHeaders, type RateLimitResult } from "@/lib/api/rate-limit";
import {
  RateLimitError,
  ValidationError,
  toAppError,
} from "@/lib/errors/app-error";
import { flattenZodError } from "@/lib/utils/validation";
import { failure } from "@/server/http/responses";
import { z } from "zod";

export const calendarWriteRateLimiter = new MemoryRateLimiter({
  limit: 60,
  windowMs: 60_000,
});

export const calendarReadRateLimiter = new MemoryRateLimiter({
  limit: 120,
  windowMs: 60_000,
});

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

export async function requireCalendarUser() {
  return assertProductEntitlement("calendar");
}

export async function enforceCalendarRateLimit(
  limiter: MemoryRateLimiter,
  userId: string,
) {
  const result = await limiter.check(`calendar:${userId}`);

  if (!result.allowed) {
    throw new RateLimitError(result.retryAfterSeconds);
  }

  return result;
}

export function calendarFailure(error: unknown): NextResponse {
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
