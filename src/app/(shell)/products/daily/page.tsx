import type { Metadata } from "next";

import { DailyWorkspace } from "@/components/daily/DailyWorkspace";
import { requireProductAccess } from "@/lib/auth/require-product-access";

export const metadata: Metadata = {
  title: "Aila Daily",
  description:
    "Plan the day from your stored tasks, notes, goals, calendar, conversations, and campaigns.",
};

export default async function AilaDailyPage() {
  await requireProductAccess("daily");
  return <DailyWorkspace />;
}
