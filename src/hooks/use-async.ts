"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { toAppError } from "@/lib/errors/app-error";

import { useIsMounted } from "./use-mounted";
import { useLatestRef } from "./use-latest-ref";

/** Lifecycle state of an async operation. */
export type AsyncStatus = "idle" | "pending" | "success" | "error";

/** The observable state of an async operation. */
export interface AsyncState<T> {
  readonly status: AsyncStatus;
  readonly data: T | null;
  readonly error: Error | null;
  readonly isIdle: boolean;
  readonly isPending: boolean;
  readonly isSuccess: boolean;
  readonly isError: boolean;
}

/** State plus the controls for running an async operation. */
export interface UseAsyncResult<T, TArgs extends readonly unknown[]> extends AsyncState<T> {
  /** Runs the operation, resolving with the value or `null` on failure. */
  readonly execute: (...args: TArgs) => Promise<T | null>;
  /** Cancels the in-flight run and returns to idle. */
  readonly reset: () => void;
}

/** Options for {@link useAsync}. */
export interface UseAsyncOptions<T, TArgs extends readonly unknown[]> {
  /** Runs the operation on mount with these arguments. */
  readonly immediate?: TArgs;
  /** Called after a successful run. */
  readonly onSuccess?: (data: T) => void;
  /** Called after a failed run. Not called when the run was superseded. */
  readonly onError?: (error: Error) => void;
}

/**
 * Runs an async operation and tracks its lifecycle.
 *
 * Overlapping runs are handled correctly: each call increments an internal
 * token and only the newest run is allowed to commit state, so a slow earlier
 * request can never overwrite a faster later one. Requests are also aborted via
 * an `AbortSignal` passed as the final argument to the operation.
 *
 * @param operation - Receives the call arguments plus an `AbortSignal`.
 * @param options - Immediate execution and lifecycle callbacks.
 * @returns The async state and its controls.
 */
export function useAsync<T, TArgs extends readonly unknown[] = []>(
  operation: (...args: [...TArgs, AbortSignal]) => Promise<T>,
  options: UseAsyncOptions<T, TArgs> = {},
): UseAsyncResult<T, TArgs> {
  const { immediate, onSuccess, onError } = options;

  const [status, setStatus] = useState<AsyncStatus>("idle");
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const operationRef = useLatestRef(operation);
  const onSuccessRef = useLatestRef(onSuccess);
  const onErrorRef = useLatestRef(onError);
  const isMounted = useIsMounted();

  const runIdRef = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (...args: TArgs): Promise<T | null> => {
      controllerRef.current?.abort();

      const controller = new AbortController();
      controllerRef.current = controller;

      const runId = runIdRef.current + 1;
      runIdRef.current = runId;

      setStatus("pending");
      setError(null);

      try {
        const result = await operationRef.current(...args, controller.signal);

        // A newer run started, or the component unmounted: discard this result.
        if (runId !== runIdRef.current || !isMounted()) return null;

        setData(result);
        setStatus("success");
        onSuccessRef.current?.(result);
        return result;
      } catch (caught) {
        if (runId !== runIdRef.current || !isMounted()) return null;
        if (controller.signal.aborted) return null;

        const appError = toAppError(caught);
        setError(appError);
        setStatus("error");
        onErrorRef.current?.(appError);
        return null;
      }
    },
    [operationRef, onSuccessRef, onErrorRef, isMounted],
  );

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    runIdRef.current += 1;
    setStatus("idle");
    setData(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (immediate) void execute(...immediate);
  }, [immediate, execute]);

  useEffect(() => () => controllerRef.current?.abort(), []);

  return useMemo(
    () => ({
      status,
      data,
      error,
      isIdle: status === "idle",
      isPending: status === "pending",
      isSuccess: status === "success",
      isError: status === "error",
      execute,
      reset,
    }),
    [status, data, error, execute, reset],
  );
}
