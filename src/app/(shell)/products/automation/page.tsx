import type { Metadata } from "next";

import { AutomationWorkspace } from "@/components/automation/AutomationWorkspace";
import { requireProductAccess } from "@/lib/auth/require-product-access";

export const metadata: Metadata = {
  title: "Aila Automation",
  description: "Create rules that send email, create calendar events, or create tasks.",
};

export default async function AilaAutomationPage() {
  await requireProductAccess("automation");
  return <AutomationWorkspace />;
}
