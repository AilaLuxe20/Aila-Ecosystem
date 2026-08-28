import type { Metadata } from "next";

import { FlowWorkspace } from "@/components/flow/FlowWorkspace";

export const metadata: Metadata = {
  title: "Aila Flow",
  description: "Define ordered steps and complete them as the work moves forward.",
};

export default function AilaFlowPage() {
  return <FlowWorkspace />;
}
