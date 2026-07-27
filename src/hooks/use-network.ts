"use client";

import { useEffect, useState } from "react";

/** Effective connection quality reported by the Network Information API. */
export type EffectiveConnectionType = "slow-2g" | "2g" | "3g" | "4g" | "unknown";

/** Observed network conditions. */
export interface NetworkState {
  /** Whether the browser believes it has connectivity. */
  readonly online: boolean;
  /** Effective connection class, where supported. */
  readonly effectiveType: EffectiveConnectionType;
  /** Whether the user has requested reduced data usage. */
  readonly saveData: boolean;
  /** Estimated downlink in megabits per second, or `null` when unknown. */
  readonly downlink: number | null;
}

/** The subset of the Network Information API this hook consumes. */
interface NetworkInformationLike {
  readonly effectiveType?: string;
  readonly saveData?: boolean;
  readonly downlink?: number;
  addEventListener?: (type: "change", listener: () => void) => void;
  removeEventListener?: (type: "change", listener: () => void) => void;
}

/**
 * Reads the Network Information API, which is not in the standard lib types.
 *
 * @returns The connection object, or `null` when unsupported.
 */
function getConnection(): NetworkInformationLike | null {
  if (typeof navigator === "undefined") return null;

  const candidate = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
  return candidate ?? null;
}

/**
 * Reads a snapshot of current network conditions.
 *
 * @returns The network state.
 */
function readNetworkState(): NetworkState {
  if (typeof navigator === "undefined") {
    return { online: true, effectiveType: "unknown", saveData: false, downlink: null };
  }

  const connection = getConnection();
  const effectiveType = connection?.effectiveType;

  return {
    online: navigator.onLine,
    effectiveType:
      effectiveType === "slow-2g" ||
      effectiveType === "2g" ||
      effectiveType === "3g" ||
      effectiveType === "4g"
        ? effectiveType
        : "unknown",
    saveData: connection?.saveData ?? false,
    downlink: connection?.downlink ?? null,
  };
}

/**
 * Tracks online status and connection quality.
 *
 * Use it to defer non-essential work on constrained connections or to surface
 * an offline banner.
 *
 * @returns The current network state, assumed online during server rendering.
 */
export function useNetwork(): NetworkState {
  const [state, setState] = useState<NetworkState>({
    online: true,
    effectiveType: "unknown",
    saveData: false,
    downlink: null,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const update = (): void => setState(readNetworkState());
    update();

    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    const connection = getConnection();
    connection?.addEventListener?.("change", update);

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      connection?.removeEventListener?.("change", update);
    };
  }, []);

  return state;
}
