"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";

import type { DashboardSummary } from "@/core/dashboard/service";
import { useWorkspaceApi } from "@/components/workspace/api";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { ToastProvider } from "@/components/ui";

const CARDS: Array<{ key: keyof DashboardSummary; label: string; href: string }> = [
  { key: "planLabel", label: "Billing plan", href: "/billing" },
  { key: "dailyNotes", label: "Daily notes", href: "/products/daily" },
  { key: "openGoals", label: "Open Daily goals", href: "/products/daily" },
  { key: "conversations", label: "Intelligence chats", href: "/products/intelligence" },
  { key: "writerDocuments", label: "Writer books", href: "/products/writer" },
  { key: "translations", label: "Translations", href: "/products/translate" },
  { key: "libraryDocuments", label: "Documents", href: "/products/documents" },
  { key: "contacts", label: "Business contacts", href: "/products/business" },
  { key: "openTasks", label: "Open tasks", href: "/products/business" },
  { key: "campaigns", label: "Ad campaigns", href: "/products/ads" },
  { key: "legalDocuments", label: "Legal documents", href: "/products/ailalegal" },
  { key: "legalConversations", label: "Legal chats", href: "/products/ailalegal" },
  { key: "automations", label: "Active automations", href: "/products/automation" },
  { key: "codingProjects", label: "Coding projects", href: "/products/coding" },
  { key: "careerApplications", label: "Job applications", href: "/products/career" },
  { key: "educationCourses", label: "Courses", href: "/products/education" },
  { key: "healthLogs", label: "Health logs", href: "/products/health" },
  { key: "financeTransactions", label: "Finance entries", href: "/products/finance" },
  { key: "travelTrips", label: "Trips", href: "/products/travel" },
  { key: "products", label: "Commerce products", href: "/products/commerce" },
  { key: "pendingOrders", label: "Pending orders", href: "/products/commerce" },
  { key: "shipments", label: "Shipments", href: "/products/shipping" },
  { key: "calendarEvents", label: "Calendar events", href: "/products/calendar" },
  { key: "apps", label: "Apps", href: "/products/apps" },
  { key: "sites", label: "Sites", href: "/products/sites" },
  { key: "flows", label: "Flows", href: "/products/flow" },
];

function DashboardWorkspaceInner(): React.JSX.Element {
  const { isSignedIn } = useAuth();
  const api = useWorkspaceApi();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    if (!isSignedIn) return;
    const response = (await api("/api/dashboard/summary", { method: "GET" }, signal)) as {
      data?: { summary?: DashboardSummary };
    };
    setSummary(response.data?.summary ?? null);
    setError(null);
    setLoading(false);
  }, [api, isSignedIn]);

  useEffect(() => {
    if (!isSignedIn) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      void load(controller.signal).catch((caught: unknown) => {
        if (controller.signal.aborted) return;
        setError(caught);
        setLoading(false);
      });
    }, 0);
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [isSignedIn, load]);

  return (
    <WorkspaceShell
      product="Dashboard"
      href="/dashboard"
      accent="cyan"
      title="Your workspace"
      description="Live counts from the products on your account. Open a card to continue the work."
      loading={loading}
      error={error}
      onRetry={() => void load()}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 transition hover:border-cyan-300/20"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-white/40">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {summary ? summary[card.key] : "—"}
            </p>
          </Link>
        ))}
      </div>
    </WorkspaceShell>
  );
}

export function DashboardWorkspace(): React.JSX.Element {
  return (
    <ToastProvider>
      <DashboardWorkspaceInner />
    </ToastProvider>
  );
}
