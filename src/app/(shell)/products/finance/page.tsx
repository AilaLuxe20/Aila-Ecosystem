import type { Metadata } from "next";

import { FinanceWorkspace } from "@/components/finance/FinanceWorkspace";
import { requireProductAccess } from "@/lib/auth/require-product-access";

export const metadata: Metadata = {
  title: "Aila Finance",
  description: "Track income, expenses, budgets, and goals. No bank connection.",
};

export default async function AilaFinancePage() {
  await requireProductAccess("finance");
  return <FinanceWorkspace />;
}
