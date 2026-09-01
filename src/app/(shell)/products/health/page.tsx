import type { Metadata } from "next";

import { HealthWorkspace } from "@/components/health/HealthWorkspace";
import { requireProductAccess } from "@/lib/auth/require-product-access";

export const metadata: Metadata = {
  title: "Aila Health",
  description:
    "Habits, wellness notes, and reminders. This is not medical care and does not diagnose.",
};

export default async function AilaHealthPage() {
  await requireProductAccess("health");
  return <HealthWorkspace />;
}
