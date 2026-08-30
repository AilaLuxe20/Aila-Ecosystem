"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import { BILLING_PLANS } from "@/core/billing/plans";
import type { BillingStatus } from "@/core/billing/types";
import { PRODUCTS, PRODUCT_LIST, type ProductKey } from "@/core/products/catalog";
import { workspaceFetch } from "@/components/workspace/api";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { ToastProvider, useToast } from "@/components/ui";

type BillingWorkspaceProps = {
  requestedProduct: ProductKey | null;
  initialBilling: BillingStatus;
};

function BillingWorkspaceInner({
  requestedProduct,
  initialBilling,
}: BillingWorkspaceProps) {
  const { error: showError } = useToast();
  const [billing, setBilling] = useState<BillingStatus>(initialBilling);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState<"checkout" | "portal" | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = (await workspaceFetch("/api/billing/status", { method: "GET" })) as {
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
  }, []);

  const requested = requestedProduct ? PRODUCTS[requestedProduct] : null;
  const hasStripeSubscription = Boolean(
    billing.status && billing.status !== "canceled" && billing.status !== "incomplete_expired",
  );
  const showPortal = hasStripeSubscription && billing.stripeConfigured;
  const showCheckout = billing.plan === "free";

  async function startCheckout() {
    setBusy("checkout");
    try {
      const response = (await workspaceFetch("/api/billing/checkout", {
        method: "POST",
        body: JSON.stringify({ product: requestedProduct }),
      })) as { data?: { checkoutUrl?: string } };
      const url = response.data?.checkoutUrl;
      if (!url) throw new Error("Stripe did not return a checkout URL.");
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
      const response = (await workspaceFetch("/api/billing/portal", { method: "POST" })) as {
        data?: { portalUrl?: string };
      };
      const url = response.data?.portalUrl;
      if (!url) throw new Error("Stripe did not return a billing portal URL.");
      window.location.assign(url);
    } catch (caught) {
      showError("Billing portal unavailable", {
        description: caught instanceof Error ? caught.message : "Unable to open the portal.",
      });
      setBusy(null);
    }
  }

  return (
    <WorkspaceShell
      product="Billing"
      href="/billing"
      accent="cyan"
      title="Aila billing"
      description="Free includes Intelligence, Daily, and Ads. Pro checkout uses Stripe, including a 7-day trial when this account has not used one. Business and Enterprise are Clerk staff grants, not self-serve Stripe prices."
      loading={loading}
      error={error}
      onRetry={() => void load()}
      actions={
        <>
          {showPortal ? (
            <button
              type="button"
              onClick={() => void openPortal()}
              disabled={busy !== null || !billing.stripeConfigured}
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black disabled:opacity-50"
            >
              {busy === "portal" ? "Opening portal…" : "Manage subscription"}
            </button>
          ) : null}
          {showCheckout ? (
            <button
              type="button"
              onClick={() => void startCheckout()}
              disabled={busy !== null || !billing.stripeConfigured || !billing.priceConfigured}
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black disabled:opacity-50"
            >
              {busy === "checkout"
                ? "Redirecting…"
                : billing.trialEligible
                  ? "Start 7-day Pro trial"
                  : "Subscribe with Stripe"}
            </button>
          ) : null}
        </>
      }
    >
      {requested ? (
        <p className="mb-6 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] px-4 py-3 text-sm text-amber-100">
          {requested.paid
            ? `${requested.title} requires an active Pro subscription or trial.`
            : `${requested.title} is included on Free. Pro raises Ads limits and unlocks paid workspaces.`}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">Plan</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{billing.planLabel}</p>
          <p className="mt-2 text-sm text-white/50">
            {billing.status ? `Stripe status: ${billing.status}` : "No Stripe subscription on this account."}
          </p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">Trial</p>
          <p className="mt-3 text-lg font-medium">
            {billing.trialing
              ? billing.trialDaysRemaining === null
                ? "Trialing"
                : `${billing.trialDaysRemaining} day${billing.trialDaysRemaining === 1 ? "" : "s"} remaining`
              : billing.trialEndsAt
                ? "Trial already used on this account"
                : billing.trialEligible
                  ? "Eligible for a 7-day Stripe trial"
                  : "No trial on this account"}
          </p>
          <p className="mt-2 text-sm text-white/50">
            {billing.trialEndsAt
              ? `Trial end: ${new Date(billing.trialEndsAt).toLocaleString()}`
              : "Trial dates are stored on the subscription, not in the browser."}
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
              ? "Cancels at the end of the current period."
              : "Payment methods and invoices are managed in the Stripe portal."}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-3 lg:grid-cols-2">
        {BILLING_PLANS.map((plan) => {
          const current = billing.plan === plan.id;
          return (
            <div key={plan.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xl font-medium">{plan.name}</p>
                <span className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                  {current ? "Current" : plan.purchasable ? "Stripe" : plan.grant === "clerk_role" ? "Staff grant" : "Included"}
                </span>
              </div>
              <p className="mt-3 text-sm text-white/55">{plan.summary}</p>
              <ul className="mt-4 space-y-2 text-sm text-white/70">
                {plan.includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {plan.purchasable && showCheckout ? (
                <button
                  type="button"
                  onClick={() => void startCheckout()}
                  disabled={busy !== null || !billing.stripeConfigured || !billing.priceConfigured}
                  className="mt-5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
                >
                  {billing.trialEligible ? "Start 7-day trial" : "Upgrade with Stripe"}
                </button>
              ) : null}
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
