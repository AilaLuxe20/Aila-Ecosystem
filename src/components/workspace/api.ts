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
): Promise<unknown> {
  const response = await fetch(path, {
    ...init,
    signal,
    headers: {
      ...(init?.body ? { "content-type": "application/json" } : {}),
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
