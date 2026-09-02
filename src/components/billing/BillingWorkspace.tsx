"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import {
  BILLING_PLANS,
  PAYSTACK_CHECKOUT_PLANS,
  type PaystackPlanInterval,
} from "@/core/billing/plans";
import type { BillingStatus } from "@/core/billing/types";
import { PRODUCTS, PRODUCT_LIST, type ProductKey } from "@/core/products/catalog";
import { useWorkspaceApi } from "@/components/workspace/api";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { ToastProvider, useToast } from "@/components/ui";

type BillingWorkspaceProps = {
  requestedProduct: ProductKey | null;
  initialBilling: BillingStatus;
};

function formatNgn(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function BillingWorkspaceInner({
  requestedProduct,
  initialBilling,
}: BillingWorkspaceProps) {
  const { error: showError } = useToast();
  const api = useWorkspaceApi();
  const [billing, setBilling] = useState<BillingStatus>(initialBilling);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState<"monthly" | "annually" | "portal" | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = (await api("/api/billing/status", { method: "GET" })) as {
        data?: { billing?: BillingStatus };
      };
      if (response.data?.billing) {
        setBilling(response.data.billing);
      }
      setError(null);
    } catch (caught) {
      setError(caught);
    } finally {
      setLoading(false);
    }
  }, [api]);

  const requested = requestedProduct ? PRODUCTS[requestedProduct] : null;
  const hasManagedSubscription = Boolean(
    billing.status &&
      billing.status !== "cancelled" &&
      billing.status !== "canceled" &&
      billing.status !== "completed",
  );
  const showPortal = hasManagedSubscription && billing.paystackConfigured;
  const showCheckout = billing.plan === "free";

  async function startCheckout(interval: PaystackPlanInterval) {
    setBusy(interval);
    try {
      const response = (await api("/api/billing/checkout", {
        method: "POST",
        body: JSON.stringify({ product: requestedProduct, interval }),
      })) as { data?: { checkoutUrl?: string } };
      const url = response.data?.checkoutUrl;
      if (!url) throw new Error("Paystack did not return a checkout URL.");
      window.location.assign(url);
    } catch (caught) {
      showError("Checkout failed", {
        description: caught instanceof Error ? caught.message : "Unable to start checkout.",
      });
      setBusy(null);
    }
  }

  async function openPortal() {
    setBusy("portal");
    try {
      const response = (await api("/api/billing/portal", { method: "POST" })) as {
        data?: { portalUrl?: string };
      };
      const url = response.data?.portalUrl;
      if (!url) throw new Error("Paystack did not return a management link.");
      window.location.assign(url);
    } catch (caught) {
      showError("Subscription management unavailable", {
        description: caught instanceof Error ? caught.message : "Unable to open Paystack management.",
      });
      setBusy(null);
    }
  }

  return (
    <WorkspaceShell
      product="billing"
      href="/billing"
      accent="cyan"
      title="Aila billing"
      description="Free includes Intelligence, Daily, Writer, Translate, Documents, and Ads. Upgrade to Aila Pro with live Paystack billing — ₦15,000/month or ₦150,000/year. Business and Enterprise remain Clerk staff grants."
      loading={loading}
      error={error}
      onRetry={() => void load()}
      actions={
        <>
          {showPortal ? (
            <button
              type="button"
              onClick={() => void openPortal()}
              disabled={busy !== null || !billing.paystackConfigured}
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black disabled:opacity-50"
            >
              {busy === "portal" ? "Opening…" : "Manage subscription"}
            </button>
          ) : null}
        </>
      }
    >
      {requested ? (
        <p className="mb-6 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] px-4 py-3 text-sm text-amber-100">
          {requested.paid
            ? `${requested.title} requires an active Pro subscription.`
            : `${requested.title} is included on Free. Pro raises Ads limits and unlocks paid workspaces.`}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">Plan</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{billing.planLabel}</p>
          <p className="mt-2 text-sm text-white/50">
            {billing.status
              ? `${billing.provider === "paystack" ? "Paystack" : billing.provider ?? "Billing"} status: ${billing.status}${billing.interval ? ` · ${billing.interval}` : ""}`
              : "No Pro subscription on this account."}
          </p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">Access</p>
          <p className="mt-3 text-lg font-medium">
            {billing.plan === "free" ? "Free workspace" : "Pro workspace unlocked"}
          </p>
          <p className="mt-2 text-sm text-white/50">
            Access follows verified Paystack subscription status on the server — not the browser.
          </p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">Renewal</p>
          <p className="mt-3 text-lg font-medium">
            {billing.currentPeriodEnd
              ? new Date(billing.currentPeriodEnd).toLocaleDateString()
              : "—"}
          </p>
          <p className="mt-2 text-sm text-white/50">
            {billing.cancelAtPeriodEnd
              ? "Won't renew. Access continues through the paid period."
              : "Manage payment methods and cancellation in Paystack."}
          </p>
        </div>
      </div>

      {showCheckout ? (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {PAYSTACK_CHECKOUT_PLANS.map((plan) => (
            <div
              key={plan.interval}
              className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.04] p-6"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/50">
                Aila Pro
              </p>
              <p className="mt-3 text-2xl font-semibold tracking-tight">{plan.label}</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {formatNgn(plan.amountNgn)}
                <span className="ml-2 text-sm font-normal text-white/50">
                  {plan.periodLabel}
                </span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-white/70">
                <li>All paid Aila workspaces</li>
                <li>Higher Ads limits</li>
                <li>Live Paystack recurring billing</li>
              </ul>
              <button
                type="button"
                onClick={() => void startCheckout(plan.interval)}
                disabled={busy !== null || !billing.paystackConfigured}
                className="mt-6 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
              >
                {busy === plan.interval
                  ? "Redirecting to Paystack…"
                  : billing.paystackConfigured
                    ? `Subscribe ${plan.interval === "monthly" ? "monthly" : "yearly"}`
                    : "Paystack not configured"}
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-8 grid gap-3 lg:grid-cols-2">
        {BILLING_PLANS.map((plan) => {
          const current = billing.plan === plan.id;
          return (
            <div key={plan.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xl font-medium">{plan.name}</p>
                <span className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                  {current
                    ? "Current"
                    : plan.purchasable
                      ? "Paystack"
                      : plan.grant === "clerk_role"
                        ? "Staff grant"
                        : "Included"}
                </span>
              </div>
              <p className="mt-3 text-sm text-white/55">{plan.summary}</p>
              <ul className="mt-4 space-y-2 text-sm text-white/70">
                {plan.includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {PRODUCT_LIST.map((product) => {
          const entitled = billing.entitledProductKeys.includes(product.key);
          return (
            <Link
              key={product.key}
              href={entitled ? product.href : `/billing?product=${product.key}`}
              className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 transition hover:border-cyan-300/20"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{product.title}</p>
                <span className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                  {product.paid ? (entitled ? "Included" : "Pro") : "Free"}
                </span>
              </div>
              <p className="mt-2 text-sm text-white/50">{product.description}</p>
            </Link>
          );
        })}
      </div>
    </WorkspaceShell>
  );
}

export function BillingWorkspace(props: BillingWorkspaceProps) {
  return (
    <ToastProvider>
      <BillingWorkspaceInner {...props} />
    </ToastProvider>
  );
}
