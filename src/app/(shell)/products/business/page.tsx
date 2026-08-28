import type { Metadata } from "next";

import { BusinessWorkspace } from "@/components/business/BusinessWorkspace";

export const metadata: Metadata = {
  title: "Aila Business",
  description: "Create contacts, assign tasks, and mark work complete in Aila Business.",
};

export default function AilaBusinessPage() {
  return <BusinessWorkspace />;
}
