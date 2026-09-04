import type { Metadata } from "next";

import { FlowWorkspace } from "@/components/flow/FlowWorkspace";
import { requireProductAccess } from "@/lib/auth/require-product-access";

export const metadata: Metadata = {
  title: "Aila Flow",
  description: "Define ordered steps and complete them as the work moves forward.",
};

export default async function AilaFlowPage() {
  await requireProductAccess("flow");
  return <FlowWorkspace />;
}
