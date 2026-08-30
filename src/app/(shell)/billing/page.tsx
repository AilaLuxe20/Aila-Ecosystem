import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getBillingStatus } from "@/core/billing/service";
import { requirePrismaUser } from "@/core/auth/clerk-user";
import { BillingWorkspace } from "@/components/billing/BillingWorkspace";
import { getActorRole, parseProductQuery } from "@/lib/auth/require-product-access";

export const metadata: Metadata = {
  title: "Billing",
  description: "Aila plans, Stripe checkout, 7-day trial status, and billing portal.",
};

type PageProps = {
  searchParams: Promise<{ product?: string; checkout?: string }>;
};

export default async function BillingPage({ searchParams }: PageProps) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/billing");
  }

  const params = await searchParams;
  const user = await requirePrismaUser();
  const role = (await getActorRole()) ?? "user";

  return (
    <BillingWorkspace
      requestedProduct={parseProductQuery(params.product ?? null)}
      initialBilling={await getBillingStatus(user.id, role)}
    />
  );
}
