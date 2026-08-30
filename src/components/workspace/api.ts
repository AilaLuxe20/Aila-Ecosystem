"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback } from "react";

export type WorkspaceApiError = {
  message: string;
  fieldErrors: Record<string, string>;
};

export function readWorkspaceApiError(body: unknown, fallback: string): WorkspaceApiError {
  if (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof (body as { error: unknown }).error === "object" &&
    (body as { error: unknown }).error !== null
  ) {
    const error = (body as { error: { message?: string; fieldErrors?: Record<string, string> } })
      .error;
    return {
      message: error.message ?? fallback,
      fieldErrors: error.fieldErrors ?? {},
    };
  }

  return { message: fallback, fieldErrors: {} };
}

export async function workspaceFetch(
  path: string,
  init: RequestInit | undefined,
  signal?: AbortSignal,
  getToken?: () => Promise<string | null>,
): Promise<unknown> {
  const token = getToken ? await getToken() : null;
  const response = await fetch(path, {
    ...init,
    signal,
    headers: {
      ...(init?.body && !(init.body instanceof FormData) ? { "content-type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (response.status === 204) {
    return null;
  }

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const parsed = readWorkspaceApiError(body, "Aila could not complete that request.");
    const error = new Error(parsed.message) as Error & { fieldErrors?: Record<string, string> };
    error.fieldErrors = parsed.fieldErrors;
    throw error;
  }

  return body;
}

export function fieldErrorsFromUnknown(error: unknown): Record<string, string> {
  if (error instanceof Error && "fieldErrors" in error) {
    return (error as Error & { fieldErrors?: Record<string, string> }).fieldErrors ?? {};
  }

  return {};
}

export function useWorkspaceApi() {
  const { getToken } = useAuth();

  return useCallback(
    (path: string, init?: RequestInit, signal?: AbortSignal) =>
      workspaceFetch(path, init, signal, getToken),
    [getToken],
  );
}
