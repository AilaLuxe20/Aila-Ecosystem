"use client";

import { useEffect, useState } from "react";
import { products } from "@/config/products";
import type { SystemStatus } from "@/core/command-center/types";

export default function SystemStatus() {
  const [status, setStatus] = useState<SystemStatus>({
    platform: "online",
    aiProviders: [],
    activeProducts: products.filter((p) => p.status === "live").length,
    totalProducts: products.length,
    workspace: "active",
  });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/command-center/status");
        const data = await res.json();
        setStatus((prev) => ({ ...prev, ...data }));
      } catch {
        // Keep default status
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const platformColor =
    status.platform === "online"
      ? "text-green-400"
      : status.platform === "degraded"
        ? "text-yellow-400"
        : "text-red-400";

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-[#080808]/80 p-8 backdrop-blur-xl">
      <h2 className="mb-6 text-xl font-semibold text-white">
        System Status
      </h2>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-white/[0.06] bg-black/30 p-4 text-center">
          <div className={`text-2xl font-bold ${platformColor}`}>
            {status.platform}
          </div>
          <p className="mt-1 text-xs text-neutral-600">
            Platform
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-black/30 p-4 text-center">
          <div className="text-2xl font-bold text-neutral-300">
            {status.activeProducts}/{status.totalProducts}
          </div>
          <p className="mt-1 text-xs text-neutral-600">
            Products
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-black/30 p-4 text-center">
          <div
            className={`text-2xl font-bold ${
              status.workspace === "active"
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {status.workspace}
          </div>
          <p className="mt-1 text-xs text-neutral-600">
            Workspace
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-black/30 p-4 text-center">
          <div className="text-2xl font-bold text-neutral-300">
            {status.aiProviders.length}
          </div>
          <p className="mt-1 text-xs text-neutral-600">
            AI Providers
          </p>
        </div>
      </div>
    </div>
  );
}
