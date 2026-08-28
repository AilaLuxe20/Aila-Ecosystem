import type { Metadata } from "next";

import { BusinessWorkspace } from "@/components/business/BusinessWorkspace";
import { requireProductAccess } from "@/lib/auth/require-product-access";

export const metadata: Metadata = {
  title: "Aila Business",
  description: "Create contacts, assign tasks, and mark work complete in Aila Business.",
};

export default async function AilaBusinessPage() {
  await requireProductAccess("business");
  return <BusinessWorkspace />;
}
