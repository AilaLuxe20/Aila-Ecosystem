"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

import { createLogger } from "@/lib/logger/logger";
import { toAppError } from "@/lib/errors/app-error";

import { ErrorState } from "@/components/ui/States";

/**
 * React error boundaries.
 *
 * Boundaries must be class components — there is still no hook equivalent of
 * `componentDidCatch`. This is the one place in the platform where a class is
 * the correct tool rather than a legacy one.
 */

const boundaryLogger = createLogger("ui.error-boundary");

/** Props for {@link ErrorBoundary}. */
export interface ErrorBoundaryProps {
  /** The subtree to protect. */
  readonly children: ReactNode;
  /** Replaces the default error UI. Receives the error and a reset callback. */
  readonly fallback?: (error: Error, reset: () => void) => ReactNode;
  /** Notified when the boundary catches an error. */
  readonly onError?: (error: Error, info: ErrorInfo) => void;
  /**
   * When any value in this array changes, the boundary resets.
   *
   * Pass the route key or a record ID so navigating away from a broken view
   * recovers automatically rather than leaving the error on screen.
   */
  readonly resetKeys?: readonly unknown[];
  /** Name recorded in logs, identifying which region failed. */
  readonly name?: string;
}

/** Internal state of {@link ErrorBoundary}. */
interface ErrorBoundaryState {
  readonly error: Error | null;
}

/**
 * Catches render-time errors in its subtree and shows a recovery UI.
 *
 * Only catches errors thrown during render, in lifecycle methods, and in
 * constructors below it. Event handlers and async code are not covered by React
 * — use `attempt` or a try/catch there.
 *
 * @example
 * <ErrorBoundary name="dashboard" resetKeys={[workspaceId]}>
 *   <Dashboard />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  /** @param props - Children, fallback, reset keys, and error callback. */
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  /**
   * Records the error so the next render shows the fallback.
   *
   * @param error - The thrown error.
   * @returns The next state.
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  /**
   * Resets the boundary when any reset key changes.
   *
   * @param previousProps - The previous props.
   */
  componentDidUpdate(previousProps: ErrorBoundaryProps): void {
    if (this.state.error === null) return;

    const previousKeys = previousProps.resetKeys ?? [];
    const currentKeys = this.props.resetKeys ?? [];

    const changed =
      previousKeys.length !== currentKeys.length ||
      currentKeys.some((key, index) => !Object.is(key, previousKeys[index]));

    if (changed) this.reset();
  }

  /**
   * Logs the failure and notifies the caller.
   *
   * @param error - The thrown error.
   * @param info - React's component stack.
   */
  componentDidCatch(error: Error, info: ErrorInfo): void {
    const appError = toAppError(error);

    boundaryLogger.error("Render failed inside boundary.", appError, {
      boundary: this.props.name ?? "unnamed",
      componentStack: info.componentStack ?? "",
    });

    this.props.onError?.(error, info);
  }

  /** Clears the error and re-renders the subtree. */
  private readonly reset = (): void => {
    this.setState({ error: null });
  };

  /** @returns The children, or the fallback when an error is held. */
  render(): ReactNode {
    const { error } = this.state;
    const { children, fallback } = this.props;

    if (error === null) return children;
    if (fallback) return fallback(error, this.reset);

    return <ErrorState error={error} onRetry={this.reset} />;
  }
}

/** Props for {@link withErrorBoundary}. */
export type WithErrorBoundaryOptions = Omit<ErrorBoundaryProps, "children">;

/**
 * Wraps a component in an {@link ErrorBoundary}.
 *
 * @param Wrapped - The component to protect.
 * @param options - Boundary configuration.
 * @returns The wrapped component.
 *
 * @example
 * export default withErrorBoundary(ReportsPanel, { name: "reports" });
 */
export function withErrorBoundary<P extends object>(
  Wrapped: React.ComponentType<P>,
  options: WithErrorBoundaryOptions = {},
): React.ComponentType<P> {
  function WithErrorBoundary(props: P): React.JSX.Element {
    return (
      <ErrorBoundary {...options}>
        <Wrapped {...props} />
      </ErrorBoundary>
    );
  }

  WithErrorBoundary.displayName = `withErrorBoundary(${Wrapped.displayName ?? Wrapped.name ?? "Component"})`;
  return WithErrorBoundary;
}
