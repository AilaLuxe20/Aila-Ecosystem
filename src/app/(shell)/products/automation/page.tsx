import type { Metadata } from "next";

import { AutomationWorkspace } from "@/components/automation/AutomationWorkspace";

export const metadata: Metadata = {
  title: "Aila Automation",
  description: "Create rules that send email, create calendar events, or create tasks.",
};

export default function AilaAutomationPage() {
  return <AutomationWorkspace />;
}
